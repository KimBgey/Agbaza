import useReveal from './useReveal'

export default function Reveal({ as: Tag = 'div', className = '', children, ...rest }) {
  const [ref, visible] = useReveal()
  return (
    <Tag ref={ref} className={`lp-reveal${visible ? ' is-visible' : ''}${className ? ' ' + className : ''}`} {...rest}>
      {children}
    </Tag>
  )
}
