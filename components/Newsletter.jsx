import React from 'react'
import Title from './Title'

const Newsletter = () => {
    return (
        <div className='flex flex-col items-center mx-4 my-36'>
            <Title title="Join Newsletter" description="Subscribe to get exclusive deals, new arrivals, and insider updates delivered straight to your inbox every week." visibleButton={false} />
            <div className='flex bg-slate-100 dark:bg-slate-900 text-sm p-1 rounded-full w-full max-w-xl my-10 border border-white dark:border-slate-800 ring ring-slate-200 dark:ring-slate-800/50'>
                <input className='flex-1 pl-5 outline-none bg-transparent text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400' type="text" placeholder='Enter your email address' />
                <button className='font-medium bg-green-500 text-white px-7 py-3 rounded-full hover:scale-103 active:scale-95 transition'>Get Updates</button>
            </div>
        </div>
    )
}

export default Newsletter