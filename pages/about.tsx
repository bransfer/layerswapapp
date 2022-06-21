import Head from 'next/head'
import Layout from '../components/layout'
import fs from 'fs'
import path from 'path'
import { serialize } from "next-mdx-remote/serialize";
import React from 'react'
import { MDXRemote } from 'next-mdx-remote'

export default function About(props) {
    return (
        <Layout>
            <div className="flex content-center items-center justify-center mb-5 space-y-5 flex-col  container mx-auto sm:px-6 lg:px-8 max-w-3xl">

                <Head>
                    <title>About LayerSwap</title>
                </Head>

                <main>
                    <div className="flex justify-center">
                        <div className="py-4 px-8 md:px-0 prose md:prose-xl text-blueGray-300">
                            <MDXRemote {...props.mdxSource} />
                        </div>
                    </div>
                </main>
            </div >
        </Layout>
    )
}

export async function getStaticProps() {
    const markdown = fs.readFileSync(path.join(process.cwd(), 'public/doc/aboutPage.md'), 'utf-8');
    const mdxSource = await serialize(markdown);
    return {
        props: {
            mdxSource
        },
    }
}