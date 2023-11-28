import React from 'react';
import { Icon } from '@iconify/react';
import onlineMeeting from '../../../public/assets/onlineMeeting.png';

const Meet = () => {
  return (
    <div className='px-5 sm:px-10 justify-center'>
      <h1 className='mb-2 text-xl font-semibold text-c-text'>Ultimate smart meeting assistant at your service</h1>
      <p className=''>Never miss out on important points in your meetings.</p>
      <div className="flex">
        <div className="flex mr-10 flex-row items-center">
          <div className='mr-4'>
            <div><p className="mb-2">Create a meeting now</p></div>
            <div>
              <a
                href="https://meet.new"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center mt-2"
              >
                <Icon className="mr-2" icon='mdi:video' />
                New Meeting
              </a></div>
          </div>
          <div className='ml-4'>
            <div><p className="mb-2">Want Meeting Summaries?</p></div>
            <div>
              <a
                href="https://minutes-of-meeting.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded inline-flex items-center mt-2"
              >
                <Icon className="mr-2" icon='mdi:video' />
                Minutes of Meeting
              </a></div>
          </div>
        </div>
        <div className="flex ml-40 flex-col items-center">
          <div>
            <img
              src={onlineMeeting}
              className="img-fluid"
              alt="online meeting"
              style={{ width: '400px', height: '400px' }}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Meet;
