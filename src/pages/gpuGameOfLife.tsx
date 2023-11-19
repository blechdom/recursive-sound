import dynamic from 'next/dynamic'

const GameOfLife = dynamic(
  () => import('@/components/GameOfLife'),
  {ssr: false}
)

export default function ChaoticFM2() {

  return <GameOfLife/>;
}