import React from "react";
import { Link, graphql } from "gatsby";

import Bio from "../components/Bio";
import Layout from "../components/Layout";
import SEO from "../components/seo";
import { siteTitle } from "../data/static";

const BlogPostTemplate = ({ data, pageContext, location, children }) => {
	const post = data.mdx;

	const { previous, next } = pageContext;
	const thumbnail = post.frontmatter.thumbnail;

	return (
		<Layout location={location} title={siteTitle}>
			<SEO
				title={post.frontmatter.title}
				description={post.excerpt}
				thumbnail={thumbnail}
			/>
			<h1>{post.frontmatter.title}</h1>
			<p
				style={{
					display: "block",
					marginBottom: "16px",
				}}
			>
				{post.frontmatter.date}
			</p>
			{children}
			<hr
				style={{
					marginBottom: "16px",
				}}
			/>
			<Bio />

			<ul
				style={{
					display: "flex",
					flexWrap: "wrap",
					justifyContent: "space-between",
					listStyle: "none",
					padding: 0,
				}}
			>
				<li>
					{previous && (
						<Link to={previous.fields.slug} rel="prev">
							← {previous.frontmatter.title}
						</Link>
					)}
				</li>
				<li>
					{next && (
						<Link to={next.fields.slug} rel="next">
							{next.frontmatter.title} →
						</Link>
					)}
				</li>
			</ul>
		</Layout>
	);
};

export default BlogPostTemplate;

export const pageQuery = graphql`
  query ($slug: String!) {
    mdx(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
      }
      body
    }
  }
`;
