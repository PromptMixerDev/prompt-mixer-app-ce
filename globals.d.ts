declare module '*.css';

declare module '*.svg' {
  export const ReactComponent: React.FunctionComponent<
    React.SVGAttributes<SVGElement>
  >;
  export default ReactComponent;
}
