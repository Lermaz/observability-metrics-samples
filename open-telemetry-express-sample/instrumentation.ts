import { context, metrics, propagation, trace } from '@opentelemetry/api';
import {
  defaultResource,
  resourceFromAttributes,
} from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
  StackContextManager,
  TracerProvider,
} from '@opentelemetry/sdk-trace';
import {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';
import { ConsoleMetricExporter, MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';

const resource = defaultResource().merge(
  resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'service-name-here',
    [ATTR_SERVICE_VERSION]: '0.1.0',
  }),
);

const metricReader = new PeriodicExportingMetricReader({
  exporter: new ConsoleMetricExporter(),
  // Default is 60000ms (60 seconds). Set to 10 seconds for demonstrative purposes only.
  exportIntervalMillis: 10000,
});

const myServiceMeterProvider = new MeterProvider({
  resource: resource,
  readers: [metricReader],
});

// Set this MeterProvider to be global to the app being instrumented.
metrics.setGlobalMeterProvider(myServiceMeterProvider);

const tracerProvider = new TracerProvider({
  resource,
  spanProcessors: [
    new BatchSpanProcessor({ exporter: new ConsoleSpanExporter() }),
  ],
});
trace.setGlobalTracerProvider(tracerProvider);

context.setGlobalContextManager(new StackContextManager().enable());

const propagator = new CompositePropagator({
  propagators: [new W3CBaggagePropagator(), new W3CTraceContextPropagator()],
});
propagation.setGlobalPropagator(propagator);
