import { useEffect, useState } from 'react'

const bibleVersions = {
  KJV: "de4e12af7f28f599-02",
  NIV: "06125adad2d5898a-01",
  ESV: "bba9f40183526463-01"
}

const bookCodes = {
  Genesis: "GEN", Exodus: "EXO", Leviticus: "LEV", Numbers: "NUM", Deuteronomy: "DEU",
  Joshua: "JOS", Judges: "JDG", Ruth: "RUT", "1 Samuel": "1SA", "2 Samuel": "2SA",
  "1 Kings": "1KI", "2 Kings": "2KI", "1 Chronicles": "1CH", "2 Chronicles": "2CH",
  Ezra: "EZR", Nehemiah: "NEH", Esther: "EST", Job: "JOB", Psalms: "PSA", Proverbs: "PRO",
  Ecclesiastes: "ECC", "Song of Solomon": "SNG", Isaiah: "ISA", Jeremiah: "JER",
  Lamentations: "LAM", Ezekiel: "EZK", Daniel: "DAN", Hosea: "HOS", Joel: "JOL",
  Amos: "AMO", Obadiah: "OBA", Jonah: "JON", Micah: "MIC", Nahum: "NAM", Habakkuk: "HAB",
  Zephaniah: "ZEP", Haggai: "HAG", Zechariah: "ZEC", Malachi: "MAL", Matthew: "MAT",
  Mark: "MRK", Luke: "LUK", John: "JHN", Acts: "ACT", Romans: "ROM", "1 Corinthians": "1CO",
  "2 Corinthians": "2CO", Galatians: "GAL", Ephesians: "EPH", Philippians: "PHP",
  Colossians: "COL", "1 Thessalonians": "1TH", "2 Thessalonians": "2TH", "1 Timothy": "1TI",
  "2 Timothy": "2TI", Titus: "TIT", Philemon: "PHM", Hebrews: "HEB", James: "JAS",
  "1 Peter": "1PE", "2 Peter": "2PE", "1 John": "1JN", "2 John": "2JN", "3 John": "3JN",
  Jude: "JUD", Revelation: "REV"
}

const stripHtml = (html) => {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent || ""
}

const VerseWidget = () => {
  const [version, setVersion] = useState("KJV")
  const [verseId, setVerseId] = useState("JHN.3.16")
  const [verseData, setVerseData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [copied, setCopied] = useState(false)

  const fetchVerse = async (selectedVersion, verseIdToFetch) => {
    const bibleId = bibleVersions[selectedVersion]
    const apiKey = import.meta.env.VITE_BIBLE_API_KEY

    setLoading(true)
    try {
      const response = await fetch(
        `https://api.scripture.api.bible/v1/bibles/${bibleId}/verses/${verseIdToFetch}`,
        {
          headers: {
            "api-key": apiKey
          }
        }
      )
      const data = await response.json()
      if (!data?.data) throw new Error("Verse not found")
      setVerseData(data.data)
      setError(false)
    } catch (err) {
      console.error(err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const getRandomVerse = async () => {
    try {
      const res = await fetch("https://labs.bible.org/api/?passage=random&type=json")
      const data = await res.json()
      const verse = data[0]

      const bookCode = bookCodes[verse.bookname]
      if (!bookCode) throw new Error("Book code not found")

      const id = `${bookCode}.${verse.chapter}.${verse.verse}`
      setVerseId(id)
      fetchVerse(version, id)
    } catch (err) {
      console.error("Random verse fetch failed:", err)
      setError(true)
    }
  }

  const copyToClipboard = () => {
    if (verseData) {
      const plainText = `${stripHtml(verseData.content)} — ${verseData.reference} (${version})`
      navigator.clipboard.writeText(plainText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareVerse = () => {
    if (verseData && navigator.share) {
      const message = `${stripHtml(verseData.content)} — ${verseData.reference} (${version})`
      navigator.share({
        title: "Bible Verse",
        text: message,
        url: window.location.href
      }).catch((err) => console.error("Share failed:", err))
    } else {
      alert("Sharing is not supported on this device.")
    }
  }

  useEffect(() => {
    if (verseId) {
      fetchVerse(version, verseId)
    }
  }, [version])

  useEffect(() => {
    getRandomVerse()
  }, [])

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Verse of the Day</h2>

      <div className="mb-4">
        <label className="text-sm text-gray-600 mr-2">Version:</label>
        <select
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        >
          {Object.keys(bibleVersions).map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>

      <button
        onClick={getRandomVerse}
        className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
      >
        Get Random Verse
      </button>

      {loading ? (
        <p className="text-gray-500">Loading verse...</p>
      ) : error || !verseData ? (
        <p className="text-red-500">Could not load verse. Try again.</p>
      ) : (
        <>
          <p className="italic text-gray-700 mb-2">{stripHtml(verseData.content)}</p>
          <p className="text-sm text-gray-500">{verseData.reference} — {version}</p>

          <div className="flex justify-center gap-3 mt-4">
            <button
              onClick={copyToClipboard}
              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
            >
              {copied ? "Copied!" : "Copy"}
            </button>

            <button
              onClick={shareVerse}
              className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600 transition"
            >
              Share
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default VerseWidget
