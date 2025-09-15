
const DB_VERSION = 6

function WriteToDatabase(name, data) {
    let openRequest = indexedDB.open("BlindBase", DB_VERSION);

    openRequest.onupgradeneeded = function (event) {
        const db = event.target.result
        db.createObjectStore("tables");
    }

    openRequest.onsuccess = function (event) {
        const db = event.target.result

        const transaction = db.transaction("tables", "readwrite")
        const store = transaction.objectStore("tables")
        store.put(data, name)

        transaction.oncomplete = () => {
            console.log(name + " stored successfully!")
        }
        transaction.onerror = (event) => {
            console.error("Transaction failed:", event.target.error)
        }
    }
}

async function FetchFromDatabase(name) {
    return new Promise((resolve, reject) => {
        let openRequest = indexedDB.open("BlindBase", DB_VERSION);

        openRequest.onupgradeneeded = function (event) {
            const db = event.target.result
            db.createObjectStore("tables");
        }

        openRequest.onsuccess = function (event) {
            const db = event.target.result

            if (!db.objectStoreNames.contains("tables")) {
                resolve(undefined)
                return
            }

            const transaction = db.transaction("tables", "readonly")
            const store = transaction.objectStore("tables")
            const getRequest = store.get(name)

            getRequest.onsuccess = () => {
                resolve(getRequest.result)
            }
            getRequest.onerror = () => reject(getRequest.error);
        }
    })
}

export { WriteToDatabase, FetchFromDatabase }