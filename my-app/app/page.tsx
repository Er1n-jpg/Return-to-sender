import Image from "next/image";

export default function Home() {
  return (
  <div className="min-h-screen bg-[url('/beachm.png')] bg-cover bg-center flex flex-col items-center justify-center" suppressHydrationWarning>
    <div className = "flex flex-col ml-188 -mb-48">
      <img className = "h-74 " src = "/rtsblue.png"></img>
      <a href = "/search">
      <button className="focus:outline-none hover:scale-110 duration-200 hover:rotate-3 hover-pointer">
        <img className  = "h-88 -mt-8" src = "/start.png"></img>
      </button>
    </a>
    </div>
  </div>
  );
}
