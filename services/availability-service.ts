import { ScheduledReading } from '@/models/ScheduledReading';
import Reader from '@/models/Reader';
import dbConnect from '@/lib/database';
import mongoose, { Document } from 'mongoose';

interface DaySchedule {
  isAvailable: boolean;
  startTime: string;
  endTime: string;
}

interface WeeklySchedule {
  [key: number]: DaySchedule;
}

interface IScheduledReading extends Document {
  scheduledDate: Date;
  duration: number;
};

export class AvailabilityService {
  static async checkReaderAvailability(
    readerId: string,
    scheduledDate: Date,
    duration: number
  ): Promise<boolean> {
    await dbConnect();

    // Get reader's schedule settings - try both userId and _id
    let reader = await Reader.findOne({ userId: readerId });
    
    // If not found by userId, try by MongoDB _id (if it's a valid ObjectId)
    if (!reader && mongoose.Types.ObjectId.isValid(readerId)) {
      reader = await Reader.findById(readerId);
    }
    
    if (!reader) {
      throw new Error('Reader not found');
    }

    // Check if the requested time is within reader's working hours
    const withinWorkingHours = this.isWithinWorkingHours(scheduledDate, reader.availability.schedule);
    
    if (!withinWorkingHours) {
      return false;
    }

    // Check for existing bookings
    const startTime = new Date(scheduledDate);
    const endTime = new Date(scheduledDate.getTime() + duration * 60000); // Convert duration to milliseconds

    const conflictingBookings = await ScheduledReading.find({
      readerId,
      status: { $in: ['scheduled', 'in_progress'] },
      $or: [
        {
          // Check if the new booking starts during an existing booking
          scheduledDate: {
            $lt: endTime,
            $gte: startTime,
          },
        },
        {
          // Check if the new booking ends during an existing booking
          $expr: {
            $and: [
              { $lt: ['$scheduledDate', endTime] },
              {
                $gte: [
                  { $add: ['$scheduledDate', { $multiply: ['$duration', 60000] }] },
                  startTime,
                ],
              },
            ],
          },
        },
      ],
    });

    return conflictingBookings.length === 0;
  }

  static isWithinWorkingHours(date: Date, schedule: any): boolean {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayName = dayNames[dayOfWeek];
    
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const timeInMinutes = hours * 60 + minutes;

    const daySchedule = schedule[dayName];
    
    if (!daySchedule || !Array.isArray(daySchedule) || daySchedule.length === 0) {
      return false;
    }

    // Check if the time falls within any of the available time slots for this day
    for (const timeSlot of daySchedule) {
      const startTime = this.parseTimeToMinutes(timeSlot.start);
      const endTime = this.parseTimeToMinutes(timeSlot.end);
      
      if (timeInMinutes >= startTime && timeInMinutes <= endTime) {
        return true;
      }
    }

    return false;
  }

  static parseTimeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  static async getAvailableSlots(
    readerId: string,
    date: Date,
    duration: number
  ): Promise<Date[]> {
    await dbConnect();

    // Try both userId and _id lookup
    let reader = await Reader.findOne({ userId: readerId });
    
    // If not found by userId, try by MongoDB _id (if it's a valid ObjectId)
    if (!reader && mongoose.Types.ObjectId.isValid(readerId)) {
      reader = await Reader.findById(readerId);
    }
    
    if (!reader) {
      throw new Error('Reader not found');
    }

    const daySchedule = reader.availability.schedule[date.getDay()];
    if (!daySchedule || !daySchedule.isAvailable) {
      return [];
    }

    const startTime = this.parseTimeToMinutes(daySchedule.startTime);
    const endTime = this.parseTimeToMinutes(daySchedule.endTime);
    const slots: Date[] = [];

    // Get existing bookings for the day
    const existingBookings = await ScheduledReading.find({
      readerId,
      status: { $in: ['scheduled', 'in_progress'] },
      scheduledDate: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999)),
      },
    }).sort('scheduledDate');

    // Generate available slots
    let currentTime = startTime;
    while (currentTime + duration <= endTime) {
      const slotDate = new Date(date);
      slotDate.setHours(Math.floor(currentTime / 60));
      slotDate.setMinutes(currentTime % 60);

      if (this.isSlotAvailable(slotDate, duration, existingBookings)) {
        slots.push(slotDate);
      }

      currentTime += 30; // 30-minute intervals
    }

    return slots;
  }

  private static isSlotAvailable(
    date: Date,
    duration: number,
    existingBookings: IScheduledReading[]
  ): boolean {
    const slotStart = date.getTime();
    const slotEnd = slotStart + duration * 60000;

    return !existingBookings.some(booking => {
      const bookingStart = booking.scheduledDate.getTime();
      const bookingEnd = bookingStart + booking.duration * 60000;
      return (
        (slotStart >= bookingStart && slotStart < bookingEnd) ||
        (slotEnd > bookingStart && slotEnd <= bookingEnd)
      );
    });
  }
}
