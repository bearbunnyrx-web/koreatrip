export default function StopItem({ children, className = '', draggable = false, ...props }) {
  return <article className={className} draggable={draggable} {...props}>{children}</article>
}
