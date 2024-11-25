import React from "react";
import Link from "next/link";
import {
  Home,
  PieChart,
  Wallet,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";


export default function () {
  return (
    <div>
      <nav className='fixed bottom-0 grid grid-cols-4 w-full gap-2 p-2 bg-white border-t'>
        <Link href='/'>
          <Button variant='ghost' className='flex flex-col items-center gap-1'>
            <Home className='h-5 w-5' />
            <span className='text-xs'>Home</span>
          </Button>
        </Link>
        <Link href='/analytics'>
          <Button variant='ghost' className='flex flex-col items-center gap-1'>
            <PieChart className='h-5 w-5' />
            <span className='text-xs'>Analytics</span>
          </Button>
        </Link>
        <Link href='/earnings'>
          <Button variant='ghost' className='flex flex-col items-center gap-1'>
            <Wallet className='h-5 w-5' />
            <span className='text-xs'>Earnings</span>
          </Button>
        </Link>
        <Link href='/tasking'>
          <Button variant='ghost' className='flex flex-col items-center gap-1'>
            <User className='h-5 w-5' />
            <span className='text-xs'>Tasking</span>
          </Button>
        </Link>
      </nav>
    </div>
  );
}
