import dynamic from 'next/dynamic'

const ThreeOhThree = dynamic(
  () => import('@/components/ThreeOhThree'),
  {ssr: false}
)

export default function threeOhThree() {

  return <ThreeOhThree/>;
}