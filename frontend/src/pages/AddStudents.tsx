/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { useNavigate } from 'react-router-dom';

export default function AddStudents() {
  const [file, setFile] = useState<File | null>(null);
  const [processId, setProcessId] = useState<string | null>(null);
  const [progress, setProgress] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);
    setSuccessMsg(null);
    setProgress(null);
    setProcessId(null);

    if (selectedFile) {
      // Validate file type
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Please select a valid CSV file.');
        return;
      }
      // Validate file size (e.g., max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit.');
        return;
      }
      setFile(selectedFile);
    }
  };

  const validateStudentsData = (data: any) => {
    const requiredKeys = [
      'ID NUMBER',
      'NAME OF THE STUDENT',
      'GENDER',
      'BRANCH',
      'BATCH',
      'MOBILE NUMBER',
      "FATHER'S NAME",
      "MOTHER'S NAME",
      "PARENT'S NUMBER",
      'BLOOD GROUP',
      'ADDRESS',
    ];
    return (
      Array.isArray(data) &&
      data.length > 0 &&
      data.every((student) =>
        typeof student === 'object' &&
        requiredKeys.every((key) => student[key] && typeof student[key] === 'string')
      )
    );
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a CSV file.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const results = await new Promise<any>((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => resolve(results),
          error: (err) => reject(err),
        });
      });

      const jsonData = results.data.slice(0, -1);
      if (!validateStudentsData(jsonData)) {
        setError('CSV format does not match required structure. Ensure all required columns are present and non-empty. Download sample CSV.');
        setIsUploading(false);
        return;
      }

      const token = localStorage.getItem('admin_token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setIsUploading(false);
        return;
      }

      const response = await fetch('https://uni-z-api.vercel.app/api/v1/admin/updatestudents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${JSON.parse(token)}`,
        },
        body: JSON.stringify(jsonData),
      });

      const data = await response.json();
      if (data.success) {
        setProcessId(data.processId);
        setSuccessMsg(data.msg || 'Processing started successfully.');
      } else {
        setError(data.msg || 'Failed to initiate upload. Please try again.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Error uploading CSV. Check your network or try again later.');
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (!processId) return;

    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) {
          setError('Authentication token not found. Please log in again.');
          clearInterval(interval);
          return;
        }

        const response = await fetch(
          `https://uni-z-api.vercel.app/api/v1/admin/updatestudents-progress?processId=${processId}`,
          {
            headers: { Authorization: `Bearer ${JSON.parse(token)}` },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
          setProgress(data);
          if (data.status === 'completed' || data.status === 'failed') {
            clearInterval(interval);
            if (data.status === 'completed') {
              setSuccessMsg('All records processed successfully!');
            } else if (data.status === 'failed') {
              setError('Processing failed. Check failed records for details.');
            }
          }
        } else {
          setError(data.msg || 'Failed to fetch progress.');
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Progress fetch error:', err);
        setError('Error fetching progress. Check your network or try again.');
        clearInterval(interval);
      }
    }, 1000); // Poll every 1 second as requested

    return () => clearInterval(interval);
  }, [processId]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/admin')}
          className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 transition-colors mb-6"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>
        <div className="bg-white shadow-2xl rounded-2xl p-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Add Students</h1>
          <p className="text-sm text-gray-600 mb-6">
            Upload a CSV file with columns: ID NUMBER, NAME OF THE STUDENT, GENDER, BRANCH, BATCH,
            MOBILE NUMBER, FATHER'S NAME, MOTHER'S NAME, PARENT'S NUMBER, BLOOD GROUP, ADDRESS.
            <br />
            <span className="text-gray-500">Maximum file size: 5MB</span>
          </p>
          {successMsg && (
            <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {successMsg}
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-600 rounded-lg flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {error}
              {error.includes('Download sample CSV') && (
                <a
                  href="/assets/samples/addstudents.csv"
                  download
                  className="ml-2 text-black underline hover:text-gray-800"
                >
                  Download Sample CSV
                </a>
              )}
            </div>
          )}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                CSV File
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-900 hover:file:bg-gray-200 disabled:opacity-50"
                disabled={isUploading}
              />
            </div>
            <button
              onClick={handleUpload}
              disabled={isUploading || !file}
              className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isUploading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8v-8H4z"
                    />
                  </svg>
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </button>
            {progress && (
              <div className="mt-6 space-y-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      progress.status === 'failed'
                        ? 'bg-red-600'
                        : progress.status === 'completed'
                        ? 'bg-green-600'
                        : 'bg-black'
                    }`}
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
                <div className="text-gray-600">
                  <p>
                    Progress: {progress.percentage}% (
                    {progress.processedRecords}/{progress.totalRecords} records)
                  </p>
                  <p>
                    Status:{' '}
                    <span
                      className={`capitalize ${
                        progress.status === 'failed'
                          ? 'text-red-600'
                          : progress.status === 'completed'
                          ? 'text-green-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {progress.status}
                    </span>
                  </p>
                  {progress.failedRecords?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-red-600">
                        {progress.failedRecords.length} record(s) failed:
                      </p>
                      <ul className="list-disc pl-5 text-sm text-red-600">
                        {progress.failedRecords.map((record: any, index: number) => (
                          <li key={index}>
                            ID: {record.id || 'Unknown'} - {record.reason || 'No reason provided'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}