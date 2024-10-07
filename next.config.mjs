/** @type {import('next').NextConfig} */
const nextConfig = {
	distDir: 'build', // Change the output directory to 'build'
	output: "export",
	images: {
	  unoptimized: true,
	},

};

  

export default nextConfig;
