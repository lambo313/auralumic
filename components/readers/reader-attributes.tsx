'use client';

import { Card } from '@/components/ui/card';
import attributes from '@/data/attributes.json';

export function ReaderAttributes() {
  return (
    <div className="grid gap-6">
      {/* Abilities Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Abilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {attributes.Abilities.map((ability) => (
            <Card key={ability.id} className="p-4  hover:from-purple-500/20 hover:to-blue-500/20">
              <h3 className="font-medium">{ability.name}</h3>
              <p className="text-sm text-muted-foreground">{ability.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Tools Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {attributes.Tools.map((tool) => (
            <Card key={tool.id} className="p-4  hover:from-purple-500/20 hover:to-blue-500/20">
              <h3 className="font-medium">{tool.name}</h3>
              <p className="text-sm text-muted-foreground">{tool.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Styles Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Styles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {attributes.Styles.map((style) => (
            <Card key={style.id} className="p-4  hover:from-purple-500/20 hover:to-blue-500/20">
              <h3 className="font-medium">{style.name}</h3>
              <p className="text-sm text-muted-foreground">{style.description}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
