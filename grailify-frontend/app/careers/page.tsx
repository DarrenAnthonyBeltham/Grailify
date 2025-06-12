"use client";

import React, { useState } from 'react';

const JobPosting = ({ title, location, department, onApply }: { title: string; location: string; department: string; onApply: () => void; }) => (
    <div className="flex justify-between items-center p-6 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors border border-neutral-200">
        <div>
            <h3 className="font-bold text-xl text-black">{title}</h3>
            <p className="mt-1 text-neutral-600">{department} &middot; {location}</p>
        </div>
        <div>
             <button onClick={onApply} className="font-semibold text-black hover:underline">
                Apply &rarr;
            </button>
        </div>
    </div>
);

const ApplicationModal = ({ isOpen, onClose, jobTitle }: { isOpen: boolean; onClose: () => void; jobTitle: string; }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-8 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-neutral-500 hover:text-black">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h2 className="text-2xl font-bold text-black">Apply for {jobTitle}</h2>
                <p className="mt-2 text-neutral-600">Please fill out the form below to submit your application.</p>
                <form className="mt-6 space-y-4">
                    <div>
                        <label htmlFor="full-name" className="block text-sm font-medium text-neutral-700">Full Name</label>
                        <input type="text" id="full-name" className="mt-1 block w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-neutral-700">Email Address</label>
                        <input type="email" id="email" className="mt-1 block w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black" />
                    </div>
                     <div>
                        <label htmlFor="resume" className="block text-sm font-medium text-neutral-700">Resume/CV</label>
                        <input type="file" id="resume" className="mt-1 block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-neutral-100 file:text-black hover:file:bg-neutral-200" />
                    </div>
                    <div className="pt-4 flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="bg-white text-black border border-neutral-300 px-6 py-2 rounded-full font-medium hover:bg-neutral-100 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="bg-black text-white px-6 py-2 rounded-full font-medium hover:bg-neutral-800 transition-colors">
                            Submit Application
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function CareersPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState('');

    const handleApplyClick = (jobTitle: string) => {
        setSelectedJob(jobTitle);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedJob('');
    };

    const jobPostings = [
        { title: "Lead Backend Engineer", department: "Engineering", location: "Remote" },
        { title: "Senior Product Authenticator (Sneakers)", department: "Operations", location: "New York, NY" },
        { title: "Digital Marketing Manager", department: "Marketing", location: "Los Angeles, CA" },
        { title: "Customer Experience Associate", department: "Support", location: "Remote" }
    ];

    return (
        <div className="bg-white">
            <div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl">
                <header className="text-center mb-16">
                    <h1 className="text-5xl font-extrabold text-black tracking-tighter">Careers at Grailify</h1>
                    <p className="mt-4 text-xl text-neutral-600">Join our team and help shape the future of commerce.</p>
                </header>

                <div className="space-y-6">
                    {jobPostings.map((job) => (
                        <JobPosting key={job.title} {...job} onApply={() => handleApplyClick(job.title)} />
                    ))}
                </div>
            </div>
            <ApplicationModal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal}
                jobTitle={selectedJob}
            />
        </div>
    );
}