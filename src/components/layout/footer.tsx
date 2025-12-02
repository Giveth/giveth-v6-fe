import {
    DiscordLogoIcon,
    GitHubLogoIcon,
    InstagramLogoIcon,
    TwitterLogoIcon
} from "@radix-ui/react-icons";
import Link from "next/link";

// Custom icons for those not in radix
const MediumIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM16.25 10.42C16.25 13.97 15.28 16.85 14.08 16.85C12.88 16.85 11.91 13.97 11.91 10.42C11.91 6.87 12.88 3.99 14.08 3.99C15.28 3.99 16.25 6.87 16.25 10.42ZM10.83 10.42C10.83 14.93 9.4 18.58 7.64 18.58C5.88 18.58 4.45 14.93 4.45 10.42C4.45 5.91 5.88 2.26 7.64 2.26C9.4 2.26 10.83 5.91 10.83 10.42ZM3.33 10.42C3.33 12.5 2.97 14.38 2.38 15.68C1.79 14.38 1.43 12.5 1.43 10.42C1.43 8.34 1.79 6.46 2.38 5.16C2.97 6.46 3.33 8.34 3.33 10.42Z" />
    </svg>
);

const YoutubeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM16.2 14.4C16.2 14.4 16.04 15.52 15.56 16C14.94 16.64 14.24 16.62 13.94 16.68C11.76 16.84 10 16.84 10 16.84C10 16.84 8.24 16.84 6.06 16.68C5.76 16.64 5.06 16.64 4.44 16C3.96 15.52 3.8 14.4 3.8 14.4C3.8 14.4 3.64 13.08 3.64 11.76V10.24C3.64 8.92 3.8 7.6 3.8 7.6C3.8 7.6 3.96 6.48 4.44 6C5.06 5.36 5.76 5.38 6.06 5.32C8.24 5.16 10 5.16 10 5.16C10 5.16 11.76 5.16 13.94 5.32C14.24 5.38 14.94 5.36 15.56 6C16.04 6.48 16.2 7.6 16.2 7.6C16.2 7.6 16.36 8.92 16.36 10.24V11.76C16.36 13.08 16.2 14.4 16.2 14.4ZM8.2 12.8L12.4 10.4L8.2 8V12.8Z" />
    </svg>
);

const RedditIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM14.86 10.96C14.86 10.96 14.86 10.97 14.86 10.98C14.86 11.75 14.28 12.38 13.56 12.38C13.26 12.38 12.98 12.28 12.75 12.11C12.08 12.58 11.18 12.88 10.19 12.91L10.53 11.31L11.64 11.55C11.66 11.83 11.9 12.05 12.2 12.05C12.53 12.05 12.8 11.78 12.8 11.45C12.8 11.12 12.53 10.85 12.2 10.85C11.94 10.85 11.72 11.02 11.64 11.25L10.39 10.98C10.35 10.97 10.31 10.99 10.3 11.03L9.88 12.91C8.89 12.88 8 12.58 7.33 12.11C7.1 12.28 6.82 12.38 6.52 12.38C5.8 12.38 5.22 11.75 5.22 10.98C5.22 10.97 5.22 10.96 5.22 10.96C4.94 10.8 4.75 10.5 4.75 10.15C4.75 9.65 5.15 9.25 5.65 9.25C5.98 9.25 6.27 9.43 6.42 9.7C7.02 9.28 7.85 9 8.78 8.96L8.79 8.96C9.72 9 10.55 9.28 11.15 9.7C11.3 9.43 11.59 9.25 11.92 9.25C12.42 9.25 12.82 9.65 12.82 10.15C12.82 10.5 12.63 10.8 12.35 10.96H14.86ZM7.15 13.65C7.15 13.84 7.31 14 7.5 14C7.69 14 7.85 13.84 7.85 13.65C7.85 13.46 7.69 13.3 7.5 13.3C7.31 13.3 7.15 13.46 7.15 13.65ZM12.5 13.65C12.5 13.84 12.66 14 12.85 14C13.04 14 13.2 13.84 13.2 13.65C13.2 13.46 13.04 13.3 12.85 13.3C12.66 13.3 12.5 13.46 12.5 13.65ZM10.04 15.25C11.3 15.25 12.02 14.71 12.06 14.67C12.15 14.58 12.15 14.44 12.06 14.35C11.97 14.26 11.83 14.26 11.74 14.35C11.73 14.36 11.12 14.8 10.04 14.8C8.96 14.8 8.35 14.36 8.34 14.35C8.25 14.26 8.11 14.26 8.02 14.35C7.93 14.44 7.93 14.58 8.02 14.67C8.06 14.71 8.78 15.25 10.04 15.25Z" />
    </svg>
);

const GitcoinIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM14.5 14.5H5.5V5.5H14.5V14.5ZM7.5 7.5H12.5V12.5H7.5V7.5Z" />
    </svg>
);

export function Footer() {
    return (
        <footer className="bg-[#fcfcff] pt-16 pb-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                    {/* Column 1 */}
                    <div className="flex flex-col gap-4">
                        <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900">Home</Link>
                        <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900">Projects</Link>
                        <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900">About Us</Link>
                        <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900">FAQ</Link>
                        <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900">Support</Link>
                    </div>

                    {/* Column 2 */}
                    <div className="flex flex-col gap-4">
                        <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900">Join Our Community</Link>
                        <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900">Documentation</Link>
                        <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900">Terms of Use</Link>
                        <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900">Onboarding Guide</Link>
                    </div>

                    {/* Column 3 */}
                    <div className="flex flex-col gap-4">
                        <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900">Partnerships</Link>
                        <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900">We're Hiring!</Link>
                    </div>

                    {/* Column 4 */}
                    <div className="flex flex-col gap-6">
                        <div className="flex gap-4">
                            <Link href="#" className="text-gray-400 hover:text-gray-900"><InstagramLogoIcon className="h-5 w-5" /></Link>
                            <Link href="#" className="text-gray-400 hover:text-gray-900"><MediumIcon /></Link>
                            <Link href="#" className="text-gray-400 hover:text-gray-900"><GitHubLogoIcon className="h-5 w-5" /></Link>
                            <Link href="#" className="text-gray-400 hover:text-gray-900"><RedditIcon /></Link>
                            <Link href="#" className="text-gray-400 hover:text-gray-900"><TwitterLogoIcon className="h-5 w-5" /></Link>
                            <Link href="#" className="text-gray-400 hover:text-gray-900"><YoutubeIcon /></Link>
                            <Link href="#" className="text-gray-400 hover:text-gray-900"><DiscordLogoIcon className="h-5 w-5" /></Link>
                            <Link href="#" className="text-gray-400 hover:text-gray-900"><GitcoinIcon /></Link>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900">Support us</span>
                            <span className="text-sm font-medium text-[#fd67ac]">with your donation</span>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-16 flex justify-end border-t border-gray-100 pt-8">
                    <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 0L10.3511 5.23607L16.0902 5.87785L11.8197 9.76393L12.9787 15.3666L8 12.5L3.02127 15.3666L4.18034 9.76393L-0.0901699 5.87785L5.64886 5.23607L8 0Z" />
                        </svg>
                        Choose Language
                    </button>
                </div>
            </div>
        </footer>
    );
}
