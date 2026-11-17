import { metrics, trace, type Span } from '@opentelemetry/api';

const tracer = trace.getTracer('dice-lib');
const meter = metrics.getMeter('dice-lib');

function rollOnce(i: number, min: number, max: number) {
  return tracer.startActiveSpan(`rollOnce:${i}`, (span: Span) => {
    const result = Math.floor(Math.random() * (max - min + 1) + min);
    span.end();
    return result;
  });
}

export function rollTheDice(rolls: number, min: number, max: number) {
  return tracer.startActiveSpan('rollTheDice', (span: Span) => {
    const result: number[] = [];
    for (let i = 0; i < rolls; i++) {
      meter.createCounter('dice_rolls', {
        description: 'Counts the number of dice rolls',
      }).add(1, { roll_number: i.toString() });
      result.push(rollOnce(i, min, max));
    }
    // Add an attribute to the span
    span.setAttribute('dicelib.rolled', result.toString());
    span.end();
    return result;
  });
}
