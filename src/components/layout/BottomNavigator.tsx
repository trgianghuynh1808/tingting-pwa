import { usePathname } from 'next/navigation'

// *INFO: internal modules
import { ExploreIcon, HomeIcon } from '../icons'
import routes from '@/routes'
import Link from 'next/link'
import packageJSON from '../../../package.json'

export default function BottomTabNavigator() {
  const pathName = usePathname()

  function checkIsActive(href: string): boolean {
    return pathName === href
  }

  return (
    <section
      id="bottom-navigation"
      className="w-full md:w-3/5 lg:w-1/5 bg-blue-400 shadow fixed bottom-0"
    >
      <div id="tabs" className="flex justify-between">
        <Link
          href={routes.home.value}
          className={`w-full ${checkIsActive(routes.home.value) ? 'text-black' : 'text-white'} justify-center inline-block text-center pt-2 pb-1`}
        >
          <HomeIcon />
          <span className="tab tab-home block text-md">Trang chủ</span>
        </Link>
        <Link
          href={routes.summary.value}
          className={`w-full ${checkIsActive(routes.summary.value) ? 'text-black' : 'text-white'} justify-center inline-block text-center pt-2 pb-1`}
        >
          <ExploreIcon />
          <span className="tab tab-kategori block text-md">Danh sách</span>
        </Link>
      </div>
      <p className="text-right w-full text-xs text-black absolute bottom-0">
        {packageJSON.version}
      </p>
    </section>
  )
}
