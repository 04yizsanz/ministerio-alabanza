export default function Spinner({ size = 'md', className = '' }) {
  const sizes = { xs: 'h-3 w-3', sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }
  return (
    <div className={`animate-spin rounded-full border-b-2 border-ministry-600 ${sizes[size] ?? sizes.md} ${className}`} />
  )
}
