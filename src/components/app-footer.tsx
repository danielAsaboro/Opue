import React from 'react'

export function AppFooter() {
  return (
    <footer className="text-center p-2 bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-400 text-xs">
      <span className="text-neutral-500 dark:text-neutral-500">Opue</span>
      {' · '}
      <a
        className="link hover:text-neutral-500 dark:hover:text-white"
        href="https://xandeum.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        Xandeum pNode Analytics
      </a>
      {' · '}
      <span className="text-neutral-400">Real-time network monitoring</span>
    </footer>
  )
}
