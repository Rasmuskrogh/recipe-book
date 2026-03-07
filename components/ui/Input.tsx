import styles from './Input.module.css'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input(_: InputProps) {
  return <div className={styles.inputWrapper}>Input</div>
}
