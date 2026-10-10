// compose(f, g)(x) === f(g(x)); used to stack higher-order components.
export const compose = (...fns) => (x) => fns.reduceRight((acc, fn) => fn(acc), x);
