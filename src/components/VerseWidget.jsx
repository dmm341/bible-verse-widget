import { useEffect, useState } from 'react'

const VerseWidget = () => {
  const [verse, setVerse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [version, setVersion] = useState("WEB") // default version name

  const fetchVerse = async () => {
    setLoading(true)
    try {
      const res = await fetch("https://labs.bible.org/api/?passage=random&type=json")
      const data = await res.json()
      setVerse(data[0]) // it's an array with one object
      setError(false)
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }
  
  const getRandomVerse = () => {
    const randomIndex = Math.floor(Math.random() * verseList.length)
    fetchVerse(verseList[randomIndex])
  }

  useEffect(() => {
    fetchVerse()
  }, [])
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Verse of the Day</h2>

      {loading ? (
        <p className="text-gray-500">Loading verse...</p>
      ) : error ? (
        <p className="text-red-500">Something went wrong. Try again.</p>
      ) : (
        <>
        <div className="mb-4">
  <label className="text-sm text-gray-600 mr-2">Version:</label>
  <select
    value={version}
    onChange={(e) => setVersion(e.target.value)}
    className="border rounded px-2 py-1 text-sm"
  >
    <option value="WEB">WEB (World English Bible)</option>
    <option value="KJV">KJV </option>
    <option value="NIV">NIV </option>
  </select>
</div>

          <p className="italic text-gray-700 mb-2">"{verse.text}"</p>
          <p className="text-sm text-gray-500 font-medium">
    {verse.bookname} {verse.chapter}:{verse.verse}
  </p>
        </>
      )}
<button onClick={fetchVerse} 
        className="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
      >
        Get Another Verse
      </button>
    </div>
  )
}

export default VerseWidget
