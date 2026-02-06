/**
 * Examples page - demonstrates key patterns
 */
import { useState } from 'react';
import { useCounterStore } from '../stores/counter-store';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';

export function ExamplesPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <h1 className="text-3xl font-bold tracking-tight">Examples</h1>
      <p className="text-muted-foreground">
        Interactive examples demonstrating the template&apos;s key patterns.
      </p>

      <div className="grid gap-8">
        <CounterExample />
        <FormExample />
      </div>
    </div>
  );
}

function CounterExample() {
  const { count, increment, decrement, reset } = useCounterStore();

  return (
    <Card title="Zustand State Management">
      <p className="text-sm text-muted-foreground mb-4">
        Global state managed with Zustand. The counter persists across route navigation.
      </p>
      <div className="flex items-center gap-4">
        <Button variant="secondary" onClick={decrement}>
          −
        </Button>
        <span className="text-2xl font-mono font-bold w-16 text-center">{count}</span>
        <Button variant="secondary" onClick={increment}>
          +
        </Button>
        <Button variant="ghost" onClick={reset}>
          Reset
        </Button>
      </div>
    </Card>
  );
}

function FormExample() {
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <Card title="Form Handling">
      <p className="text-sm text-muted-foreground mb-4">
        Basic form with controlled inputs and validation.
      </p>
      {submitted ? (
        <div className="space-y-2">
          <p className="text-green-600 font-medium">Hello, {name}!</p>
          <Button
            variant="ghost"
            onClick={() => {
              setName('');
              setSubmitted(false);
            }}
          >
            Reset
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />
          <Button type="submit" disabled={!name.trim()}>
            Submit
          </Button>
        </form>
      )}
    </Card>
  );
}
