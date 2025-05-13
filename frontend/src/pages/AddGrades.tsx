/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { useNavigate } from 'react-router-dom';

export default function AddGrades() {
  const [file, setFile] = useState<File | null>(null);
  const [processId, setProcessId] = useState<string | null>(null);
  const [progress, setProgress] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [year, setYear] = useState<string>('E1');
  const [sem, setSem] = useState<string>('Sem - 1');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);
    setSuccessMsg(null);
    setProgress(null);
    setProcessId(null);
    setPreviewData([]);
    setPreviewHeaders([]);

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

      // Parse file for preview
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        preview: 5, // Limit to 5 rows for preview
        complete: (results) => {
          const validData = results.data.filter(
            (row: any) => row && typeof row === 'object' && row.Username
          );
          if (validData.length === 0) {
            setError('No valid data found in the CSV file.');
            return;
          }
          setPreviewData(validData);
          // Extract headers, simplify complex ones (e.g., Grades/0/SubjectName -> SubjectName)
          const headers = Object.keys(validData[0] || {}).map((key) => {
            const parts = key.split('/');
            return parts[parts.length - 1];
          });
          setPreviewHeaders(headers);
        },
        error: () => {
          setError('Error parsing CSV file for preview.');
        },
      });
    }
  };

  const validateGradesData = (data: any[]) => {
    if (!Array.isArray(data) || data.length === 0 || !data[0] || typeof data[0] !== 'object') {
      return { valid: false, message: 'CSV file is empty or invalid' };
    }

    const requiredKeys = ['Username', 'Grades/0/SubjectName', 'Grades/0/Grade'];
    const missingKeys = requiredKeys.filter(
      (key) => !Object.prototype.hasOwnProperty.call(data[0], key)
    );
    if (missingKeys.length > 0) {
      return { valid: false, message: `Missing columns: ${missingKeys.join(', ')}` };
    }

    return { valid: true };
  };

  function transformGradesJson(inputJson: any[], semesterName: string) {
    if (!Array.isArray(inputJson)) {
      throw new Error('Input must be an array');
    }
    if (!semesterName || typeof semesterName !== 'string') {
      throw new Error('SemesterName must be a non-empty string');
    }

    const output: any = {
      SemesterName: semesterName,
      Students: [],
    };

    inputJson.forEach((student, index) => {
      if (!student.Username) {
        throw new Error(`Student at index ${index} missing Username`);
      }

      const studentData: any = {
        Username: student.Username,
        Grades: [],
      };

      const gradeKeys: any = Object.keys(student).filter((key) => key.startsWith('Grades/'));
      const gradesByIndex: any = {};

      gradeKeys.forEach((key: any) => {
        const match = key.match(/Grades\/(\d+)\/(.+)/);
        if (!match) {
          throw new Error(`Invalid grade key format: ${key}`);
        }
        const [, index, property] = match;
        if (!gradesByIndex[index]) {
          gradesByIndex[index] = {};
        }
        gradesByIndex[index][property] = student[key];
      });

      studentData.Grades = Object.keys(gradesByIndex)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map((index) => {
          const grade = gradesByIndex[index];
          if (!grade.SubjectName || !grade.Grade) {
            throw new Error(`Incomplete grade data for student ${student.Username} at index ${index}`);
          }
          return {
            SubjectName: grade.SubjectName,
            Grade: grade.Grade,
          };
        });

      output.Students.push(studentData);
    });

    return output;
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a CSV file.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccessMsg(null);
    setPreviewData([]);
    setPreviewHeaders([]);

    try {
      const results = await new Promise<any>((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => resolve(results),
          error: (err) => reject(err),
        });
      });

      const validData = results.data.filter(
        (row: any) => row && typeof row === 'object' && row.Username
      );

      const validation = validateGradesData(validData);
      if (!validation.valid) {
        setError(`${validation.message}. Ensure all required columns are present. Download sample CSV.`);
        setIsUploading(false);
        return;
      }

      const token = localStorage.getItem('admin_token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setIsUploading(false);
        return;
      }

      const jsonData = transformGradesJson(validData, `${year}*${sem}`);
      const response = await fetch('https://uni-z-api.vercel.app/api/v1/admin/addgrades', {
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
              setSuccessMsg('All grades processed successfully!');
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
    }, 1000); // Poll every 1 second

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
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Add Grades</h1>
          <p className="text-sm text-gray-600 mb-6">
            Upload a CSV file with columns: Username, Grades/0/SubjectName, Grades/0/Grade, etc.
            <br />
            <span className="text-gray-500">Maximum file size: 5MB</span>
          </p>
          {successMsg && (
            <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 26"
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
                  href="/assets/samples/addgrades.csv"
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
              <label className="block text-sm font-medium text-gray-500 mb-1">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                disabled={isUploading}
              >
                <option value="E1">E1</option>
                <option value="E2">E2</option>
                <option value="E3">E3</option>
                <option value="E4">E4</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Semester</label>
              <select
                value={sem}
                onChange={(e) => setSem(e.target.value)}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                disabled={isUploading}
              >
                <option value="Sem - 1">Sem - 1</option>
                <option value="Sem - 2">Sem - 2</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">CSV File</label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-900 hover:file:bg-gray-200 disabled:opacity-50"
                disabled={isUploading}
              />
            </div>
            {previewData.length > 0 && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  File Preview ({previewData.length} rows)
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        {previewHeaders.map((header, index) => (
                          <th
                            key={index}
                            className="px-4 py-2 text-left text-sm font-medium text-gray-500 border-b border-gray-200"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b border-gray-200">
                          {previewHeaders.map((header, colIndex) => {
                            const originalKey = Object.keys(row).find((key) =>
                              key.endsWith(`/${header}`)
                            ) || header;
                            return (
                              <td
                                key={colIndex}
                                className="px-4 py-2 text-sm text-gray-600"
                              >
                                {row[originalKey] || '-'}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {previewData.length === 5 && (
                  <p className="mt-2 text-sm text-gray-500">
                    Showing first 5 rows. Upload to process all records.
                  </p>
                )}
              </div>
            )}
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
                            Username: {record.id || 'Unknown'} - {record.reason || 'No reason provided'}
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