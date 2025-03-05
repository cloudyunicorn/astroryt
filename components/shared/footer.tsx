import { APP_NAME } from "@/lib/constants"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-purple-900/30 bg-gradient-to-b from-[#0F072C] to-[#2A0944]">
      <div className="p-5 text-center text-purple-200/80">
        © {currentYear} {APP_NAME}. All Rights Reserved. 
        <span className="block mt-2 text-sm text-purple-300/60">
          Crafted with ♡ by the Cosmic Team
        </span>
      </div>
    </footer>
  )
}

export default Footer