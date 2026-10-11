declare module "tunnel-rat" {
  interface Tunnel {
    In: ({ children }: Props) => null;
    Out: () => JSX.Element;
  }

  function tunnel(): Tunnel;
  export default tunnel;
}
