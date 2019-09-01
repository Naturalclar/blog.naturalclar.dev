import React from 'react'
// @ts-ignore @types not provided
import Highlight, { defaultProps } from 'prism-react-renderer'
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live'

type Line = {
  token: string
  key: number
}

type LineProps = {
  line: Line[]
  key: number
}

type Token = Line[]

type Props = {
  codeString: string
  language: string
  className: string
  style: Record<string, any>
  'react-live': boolean
  tokens: Token[]
  getLineProps: (props: LineProps) => LineProps
  getTokenProps: (props: any) => Record<string, any>
}

export const Code = ({ codeString, language, ...props }: Props) => {
  if (props['react-live']) {
    return (
      <LiveProvider code={codeString} noInline={true}>
        <LiveEditor />
        <LiveError />
        <LivePreview />
      </LiveProvider>
    )
  } else {
    return (
      <Highlight {...defaultProps} code={codeString} language={language}>
        {({ className, style, tokens, getLineProps, getTokenProps }: Props) => (
          <pre className={className} style={style}>
            {tokens.map((line, i) => (
              <div {...getLineProps({ line, key: i })}>
                {line.map((token, key) => (
                  <span {...getTokenProps({ token, key })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    )
  }
}
