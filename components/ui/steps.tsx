interface Step {
  title: string
  description: string
}

interface StepsProps {
  steps: Step[]
  currentStep: number
  className?: string
}

export function Steps({ steps, currentStep, className = "" }: StepsProps) {
  return (
    <nav aria-label="Progress" className={className}>
      <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
        {steps.map((step, index) => (
          <li key={step.title} className="md:flex-1">
            <div
              className={`group flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4 ${
                index <= currentStep
                  ? "border-primary"
                  : "border-border"
              }`}
            >
              <span className="text-sm font-medium">
                Step {index + 1}
              </span>
              <span className="text-sm font-semibold">
                {step.title}
              </span>
              <span className="text-sm text-muted-foreground">
                {step.description}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  )
}
