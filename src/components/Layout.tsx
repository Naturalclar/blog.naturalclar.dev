import React from 'react'
import { Link } from 'gatsby'

type Location = {
  pathname: string
}

type Props = {
  location: Location
  title: string
  children: React.ReactNode
}

class Layout extends React.Component<Props> {
  render() {
    const { location, title, children } = this.props
    // @ts-ignore
    const rootPath = `${__PATH_PREFIX__}/`
    let header: React.ReactNode

    if (location.pathname === rootPath) {
      header = (
        <h1
          style={{
            marginBottom: '24px',
            marginTop: 0,
          }}
        >
          <Link
            style={{
              boxShadow: 'none',
              textDecoration: 'none',
              color: 'inherit',
            }}
            to={'/'}
          >
            {title}
          </Link>
        </h1>
      )
    } else {
      header = (
        <h3
          style={{
            fontFamily: 'Montserrat, sans-serif',
            marginTop: 0,
          }}
        >
          <Link
            style={{
              boxShadow: 'none',
              textDecoration: 'none',
              color: 'inherit',
            }}
            to={'/'}
          >
            {title}
          </Link>
        </h3>
      )
    }
    return (
      <div
        style={{
          marginLeft: 'auto',
          marginRight: 'auto',
          maxWidth: '680px',
          padding: '24px 12px',
        }}
      >
        {header}
        {children}
        <footer>
          © {new Date().getFullYear()}, Built with{' '}
          <a href="https://www.gatsbyjs.org">Gatsby</a>
        </footer>
      </div>
    )
  }
}

export default Layout
