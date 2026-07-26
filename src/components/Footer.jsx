import React from 'react'

const Footer = () => {
  return (
    <footer
      style={{
        background: "#070B14",
        borderTop: "1px solid rgba(201, 168, 76, 0.25)",
        boxShadow: "0 -4px 30px rgba(201, 168, 76, 0.08)",
      }}
      className="flex justify-between items-center px-10 py-5"
    >
      {/* Left - Copyright */}
      <div className="flex items-center gap-3">
        <span
          className="text-lg font-bold tracking-widest"
          style={{ 
            color: "#C9A84C", 
            textShadow: "0 0 15px rgba(201,168,76,0.5), 0 0 30px rgba(201,168,76,0.2)" 
          }}
        >
        Copyright
        </span>
        <span style={{ color: "rgba(201,168,76,0.2)" }}>✦</span>
        <p className="text-xs tracking-widest uppercase" style={{ color: "#9CA3AF", letterSpacing: "1.5px" }}>
  © {new Date().getFullYear()} All rights reserved
</p>
      </div>

      {/* Center - tagline */}
      <p className="text-xs tracking-widest hidden md:block"
  style={{ color: "rgba(201,168,76,0.5)", letterSpacing: "3px" }}>
  CONNECT • COLLABORATE • CREATE
</p>

      {/* Right - Social Icons */}
      <nav className="flex gap-6 items-center">
        {/* Twitter */}
        <a href="#"
          style={{ color: "#374151", transition: "all 0.3s" }}
          onMouseOver={e => {
            e.currentTarget.style.color = "#C9A84C";
            e.currentTarget.style.filter = "drop-shadow(0 0 8px rgba(201,168,76,0.8))";
            e.currentTarget.style.transform = "translateY(-3px)";
          }}
          onMouseOut={e => {
            e.currentTarget.style.color = "#374151";
            e.currentTarget.style.filter = "none";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" className="fill-current">
            <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
          </svg>
        </a>

        {/* YouTube */}
        <a href="#"
          style={{ color: "#374151", transition: "all 0.3s" }}
          onMouseOver={e => {
            e.currentTarget.style.color = "#C9A84C";
            e.currentTarget.style.filter = "drop-shadow(0 0 8px rgba(201,168,76,0.8))";
            e.currentTarget.style.transform = "translateY(-3px)";
          }}
          onMouseOut={e => {
            e.currentTarget.style.color = "#374151";
            e.currentTarget.style.filter = "none";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" className="fill-current">
            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
          </svg>
        </a>

        {/* Facebook */}
        <a href="#"
          style={{ color: "#374151", transition: "all 0.3s" }}
          onMouseOver={e => {
            e.currentTarget.style.color = "#C9A84C";
            e.currentTarget.style.filter = "drop-shadow(0 0 8px rgba(201,168,76,0.8))";
            e.currentTarget.style.transform = "translateY(-3px)";
          }}
          onMouseOut={e => {
            e.currentTarget.style.color = "#374151";
            e.currentTarget.style.filter = "none";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" className="fill-current">
            <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
          </svg>
        </a>
      </nav>
    </footer>
  )
}

export default Footer;