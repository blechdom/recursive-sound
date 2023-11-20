import dynamic from 'next/dynamic'

const GameOfLife = dynamic(
  () => import('@/components/GameOfLife'),
  {ssr: false}
)

export default function gpuGameOfLife() {

  return <GameOfLife/>;
}