const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_APPS';

function isStorageExist() {
    if(typeof (Storage) === undefined) {
        alert('Browser yang Anda gunakan tidak mendukung local storage');
        return false;
    }
    return true;
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if(data !== null) {
        for(const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT))
}

function generateID() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
    return {
        id,
        title,
        author,
        year,
        isCompleted
    }
}

function findBook(bookID) {
    for(const bookItem of books) {
        if(bookItem.id === bookID) {
            return bookItem;
        }
    }
    return null;
}

function findBookIndex(bookID) {
    for(const index in books) {
        if(books[index].id === bookID) {
            return index;
        }
    }
    return -1;
}

function saveData() {
    if(isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function createBook(bookObject) {
    const { id, title, author, year, isCompleted } = bookObject;

    let container = document.createElement('div');
    container.classList.add('book');
    container.setAttribute('id', `book-${id}`);

    container.innerHTML = `
        <h3 class="book-title">${title}</h3>
        <p class="book-author">Penulis: ${author}</p>
        <p class="book-year">Tahun: ${year}</p>
    `;

    if (isCompleted) {
        const unfinishButton = document.createElement('button');
        unfinishButton.classList.add('button-unfinish');
        unfinishButton.innerText = 'Tandai Belum Selesai';
        unfinishButton.addEventListener('click', function() {
            let result = confirm("Yakin akan membuat buku menjadi belum selesai dibaca?");
            if(result == true) {
                makeBookUnFinish(id);
            }
        }) 

        const deletButton = document.createElement('button');
        deletButton.classList.add('button-delete');
        deletButton.innerText = 'Hapus';
        deletButton.addEventListener('click', function() {
            let result = confirm("Yakin akan menghapus data buku?");
            if(result == true) {
                deleteBook(id);
            }
        })

        let actionBook = document.createElement('div');
        actionBook.classList.add('book-action');
        actionBook.append(unfinishButton, deletButton);
        container.append(actionBook)

    } else {
        const finishButton = document.createElement('button');
        finishButton.classList.add('button-finish');
        finishButton.innerText = 'Tandai Selesai';
        finishButton.addEventListener('click', function() {
            let result = confirm("Yakin akan membuat buku menjadi selesai dibaca?");
            if(result == true) {
                makeBookFinish(id);
            }
        })

        const deletButton = document.createElement('button');
        deletButton.classList.add('button-delete');
        deletButton.innerText = 'Hapus';
        deletButton.addEventListener('click', function() {
            let result = confirm("Yakin akan menghapus data buku?");
            if(result == true) {
                deleteBook(id);
            }
        })

        let actionBook = document.createElement('div');
        actionBook.classList.add('book-action');
        actionBook.append(finishButton, deletButton);
        container.append(actionBook)
    }

    return container;
}

function addBook() {
    const bookTitle = document.getElementById('book-title').value;
    const bookAuthor = document.getElementById('book-author').value;
    const bookYear = document.getElementById('book-year').value;
    const bookStatus = document.querySelector('input[name="book-status"]:checked').value;
    const bookStatusVal = JSON.parse(bookStatus);

    const bookID = generateID();
    const bookObject = generateBookObject(bookID, bookTitle, bookAuthor, bookYear, bookStatusVal);
    books.push(bookObject);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData()

}

function makeBookFinish(bookID) {
    const bookTarget = findBook(bookID);
    if(bookTarget == null) return;

    bookTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData()
}

function makeBookUnFinish(bookID) {
    const bookTarget = findBook(bookID);

    if(bookTarget == null) return;

    bookTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData()
}

function deleteBook(bookID) {
    const bookTarget = findBookIndex(bookID);
    
    if(bookTarget === -1) return;
    
    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData()
}

function searchBook(e) {
    e.preventDefault();
    let allBooks = document.querySelectorAll('.book-title');
    let searchVal = e.target.value.trim().toLowerCase();

    allBooks.forEach(book => {
        book.parentElement.style.display = 'revert';

        if(!book.innerText.toLowerCase().includes(searchVal)) {
            book.parentElement.style.display = 'none';
        }
    })
}

document.addEventListener('DOMContentLoaded', function() {
    const submitBookForm = document.getElementById('book-form');

    submitBookForm.addEventListener('submit', function(e) {
        e.preventDefault();
        addBook();
        this.reset();
    });

    if(isStorageExist()) {
        loadDataFromStorage();
    }
    
})

document.addEventListener(RENDER_EVENT, function() {
    const unfinishBookList = document.getElementById('book-uncomplete');
    const finishBookList = document.getElementById('book-complete');

    unfinishBookList.innerHTML = '';
    finishBookList.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = createBook(bookItem);
        if(bookItem.isCompleted) {
            finishBookList.append(bookElement);
        } else {
            unfinishBookList.append(bookElement);
        }
    }
})