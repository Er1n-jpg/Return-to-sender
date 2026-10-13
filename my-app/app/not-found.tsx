import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex h-screen bg-[#E5D8BB] justify-center items-center text-black px-6">
      <div className="bg-[#FBF6EA] rounded-lg px-10 py-12 max-w-md w-full text-center">
        <p className="text-6xl font-semibold mb-2">404</p>
        <h1 className="text-2xl font-semibold mb-3">Cooked.</h1>
        <p className="text-black/70 mb-8">
          Oops this probably isn't avalible yet... check back later?
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/"
            className="bg-black text-white px-4 py-2 rounded-lg hover:scale-105 transition duration-300"
          >
            Back home
          </Link>
          <Link
            href="/make"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:scale-105 transition duration-300"
          >
            Write a letter
          </Link>
        </div>
      </div>
    </div>
  )
}