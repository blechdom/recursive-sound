import dynamic from 'next/dynamic'

const GameOfLife = dynamic(
  () => import('@/components/GameOfLifeAudioTest'),
  {ssr: false}
)

export default function gpuGameOfLifeAudioTest() {

  return <GameOfLife/>;
}