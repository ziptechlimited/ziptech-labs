import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { ICohort, IUser } from '../types/shared';
import toast from 'react-hot-toast';

const FacilitatorDashboard: React.FC = () => {
    const { user, token } = useAuth();
    const [cohorts, setCohorts] = useState<ICohort[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Create Cohort State
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [newCohortName, setNewCohortName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        fetchCohorts();
    }, []);

    const fetchCohorts = async () => {
        try {
            const res = await axios.get(`${API_CONFIG.BASE_URL}/cohorts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Filter to only show cohorts created by this facilitator
            // In a real app the API should probably do this filtering or return "my cohorts"
            console.log('User ID:', user?._id);
            console.log('All Cohorts:', res.data);
            
            const myCohorts = res.data.filter((c: ICohort) => {
                const facilitatorId = typeof c.facilitator === 'string' ? c.facilitator : c.facilitator._id;
                console.log(`Checking cohort ${c.name}, facID: ${facilitatorId}, matches: ${facilitatorId.toString() === user?._id?.toString()}`);
                return facilitatorId.toString() === user?._id?.toString();
            });
            setCohorts(myCohorts);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch cohorts');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCohort = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(
                `${API_CONFIG.BASE_URL}/cohorts`, 
                { name: newCohortName, startDate, endDate },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Cohort created successfully!');
            setCreateModalOpen(false);
            setNewCohortName('');
            setStartDate('');
            setEndDate('');
            fetchCohorts();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create cohort');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Facilitator Dashboard</h2>
                <button
                    onClick={() => setCreateModalOpen(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                    Create New Cohort
                </button>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : cohorts.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow text-center">
                    <p className="text-gray-500 mb-4">You haven't created any cohorts yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {cohorts.map((cohort) => (
                        <div key={cohort._id} className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h3 className="text-lg font-medium text-gray-900">{cohort.name}</h3>
                                <p className="text-sm text-gray-500">
                                    {new Date(cohort.startDate).toLocaleDateString()} - {new Date(cohort.endDate).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="p-6">
                                <div className="mb-4">
                                    <p className="text-sm font-medium text-gray-500">Invite Code</p>
                                    <div className="mt-1 flex items-center space-x-2">
                                        <code className="bg-gray-100 px-2 py-1 rounded text-lg font-mono text-indigo-600 select-all">
                                            {cohort.inviteCode || 'No Code'}
                                        </code>
                                        <span className="text-xs text-gray-400">(Share this with users)</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-2">Members ({cohort.members.length})</p>
                                    <ul className="divide-y divide-gray-200">
                                        {(cohort.members as IUser[]).map((member) => (
                                            <li key={member._id} className="py-2 text-sm text-gray-700">
                                                {member.name} ({member.email})
                                            </li>
                                        ))}
                                        {cohort.members.length === 0 && (
                                            <li className="text-sm text-gray-400 italic">No members yet.</li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Cohort Modal */}
            {createModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setCreateModalOpen(false)}></div>
                        <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full z-10 p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Cohort</h3>
                            <form onSubmit={handleCreateCohort} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Cohort Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        value={newCohortName}
                                        onChange={(e) => setNewCohortName(e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Start Date</label>
                                        <input
                                            type="date"
                                            required
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">End Date</label>
                                        <input
                                            type="date"
                                            required
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                    <button
                                        type="submit"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                                    >
                                        Create
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                                        onClick={() => setCreateModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacilitatorDashboard;
