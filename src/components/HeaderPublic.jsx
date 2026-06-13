import { Avatar, Dropdown, Navbar } from "flowbite-react";
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function HeaderPublic(){

    const navigate = useNavigate();
    const location = useLocation();
      
    return (
        <nav class="relative bg-green-900">
            <div class="w-full px-2 sm:px-6 lg:px-8">
                <div class="relative flex h-16 items-center justify-between">
                    <div class="flex flex-1 items-center justify-between sm:items-stretch">
                        <div class="flex shrink-0 items-center gap-2">
                            <Link to="/" class="flex shrink-0 items-center gap-2">
                                <Avatar img="/liveTv.jpg" alt="avatar of Jese" rounded />
                                <span class="text-white self-center text-xl text-heading font-semibold whitespace-nowrap">Live TV</span>
                            </Link>
                            
                        </div>
                        <div class="sm:ml-6 sm:block">
                            <div class="flex space-x-4">
                                    <Link to="https://livetv.sysnolodge.com.au/fifa2026.html" target="_blank" class={`rounded-md px-3 py-2 text-sm font-medium ${'text-white bg-white/5 text-gray-300 hover:bg-white/5 hover:text-white'} hidden md:block`}>Fifa 2026 Schedule</Link>
                                    <Link to="/fifa2026" class={`rounded-md px-3 py-2 text-sm font-medium ${'text-white bg-white/5 text-gray-300 hover:bg-white/5 hover:text-white'} hidden sm:block`}>Fifa 2026 Live</Link>

                                <div className="md:hidden">
                                    <Dropdown arrowIcon={true} label="Watch Fifa 2026 Live"
                                            class={`rounded-md text-sm font-medium text-white bg-white/5 text-gray-300 hover:bg-white/5 hover:text-white'} `}
                                    >
                                        <Dropdown.Item as={Link} to="https://livetv.sysnolodge.com.au/fifa2026.html" target="_blank">
                                            Fifa 2026 Schedule
                                        </Dropdown.Item>
                                        <Dropdown.Item as={Link} to="/fifa2026">
                                            Fifa 2026 Live
                                        </Dropdown.Item>
                                    </Dropdown>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
      ); 
}