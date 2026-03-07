import styles from './Spinner.module.css'

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Spinner({ size = 'md', className: _ }: SpinnerProps) {
  return <div className={styles.spinner} data-size={size} />
}
