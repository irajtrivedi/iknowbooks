const express = require('express');
const bodyParser = require('body-parser');
const http = require('https');
const xml2js = require('xml2js');
const parser = new xml2js.Parser();
const book_host = 'https://api.nytimes.com';
const goodreads_host = 'https://www.goodreads.com';

const server = express();
server.use(bodyParser.json());

function fetch_book_details(bookType, callback) {
    let path = book_host + '/svc/books/v3/lists/overview.json?api-key=7dfc493d35bd4c87aff6f67a60e24b8c';
    let dataToSend = '';
    let book_info = '';
    let flag;
    if (bookType != undefined || bookType != '') {
        //Fetching data from NYTimes best-seller list
        http.get(path, responseFromAPI => {
            responseFromAPI.on('data', function (chunk) {
                if (chunk != undefined) {
                    book_info += chunk;
                }
            })
            responseFromAPI.on('end', function () {
                book_info = JSON.parse(book_info);
                if (book_info === undefined || book_info.status != 'OK' || book_info == '') {
                    dataToSend = "Sorry! couldn't fetch books list";
                    callback(dataToSend);
                } else {
                    dataToSend = "Here's The New York Times Best-Sellers "+ bookType.toUpperCase() +" books for you to read";
                    if (bookType.toLowerCase() == 'fiction')
                        flag = 0;
                    else if (bookType.toLowerCase() == 'non-fiction' || bookType.toLowerCase() == 'nonfiction')
                        flag = 1;
                    else if (bookType.toLowerCase() == 'sports' || bookType.toLowerCase() == 'fitness')
                        flag = 15;
                    else if (bookType.toLowerCase() == 'pictures book' || bookType.toLowerCase() == 'childrens book' || bookType.toLowerCase() == "children's book")
                        flag = 8;
                    else if (bookType.toLowerCase() == 'business' || bookType.toLowerCase() == 'corporate')
                        flag = 13;
                    else if (bookType.toLowerCase() == 'science' || bookType.toLowerCase() == 'maths')
                        flag = 14;
                    else
                        flag = undefined;

                    if (flag === undefined) {
                        dataToSend = "I didn't find any genres like " + bookType;
                    } else {
                        for (var i = 0; i <= 4; i++) {
                            // dataToSend += "<a href='#' onclick=bot.sendEvent('books_info_event')> <br />" + (i + 1) + ". " + book_info.results.lists[flag].books[i].title + ' by ' + book_info.results.lists[flag].books[i].author + "</a>";
                            dataToSend += "<br />" + (i + 1) + ". " + book_info.results.lists[flag].books[i].title + ' by ' + book_info.results.lists[flag].books[i].author;
                        }
                    }
                    callback(dataToSend);
                }
            })
        }, (error) => {
            dataToSend = "Sorry! couldn't fetch books list" + cityName;
            callback(dataToSend);
        });
    }
}

// function fetch_book_reviews(bookName, callback) {
//     let path = book_host + '/svc/books/v3/reviews.json?api-key=7dfc493d35bd4c87aff6f67a60e24b8c&title=' + bookName + '';
//     let dataToSend = '';
//     let book_info = '';
//     //Fetching data from NYTimes best-seller list
//     http.get(path, responseFromAPI => {
//         responseFromAPI.on('data', function (chunk) {
//             if (chunk != undefined) {
//                 book_info += chunk;
//             }
//         })
//         responseFromAPI.on('end', function () {
//             book_info = JSON.parse(book_info);
//             if (book_info === undefined || book_info.status != 'OK' || book_info == ''
//                 || book_info.num_results == 0 || book_info.results[0].book_title.toLowerCase() != bookName.toLowerCase()) {
//                 fetch_goodreads_review(bookName, function (result) {
//                     if (result !== undefined) {
//                         callback(result);
//                     }
//                 });
//             } else {
//                 dataToSend = "Below is the summmary for " + book_info.results[0].book_title + ' wriiten by ' + book_info.results[0].book_author + " and reviewed by " + book_info.results[0].byline;
//                 dataToSend += "<br />" + book_info.results[0].summary;
//                 dataToSend += "<br /><br />For more please click on the below link:";
//                 dataToSend += "<br />" + book_info.results[0].url;
//                 callback(dataToSend);
//             }
//         })
//     }, (error) => {
//         dataToSend = "Sorry! couldn't fetch books list" + cityName;
//         callback(dataToSend);
//     });
// }

function fetch_goodreads_review(bookName, callback) {
    let path = goodreads_host + '/book/title.xml?key=Fr4FMxJzYpn5HgZVvb5eQ&title=' + bookName;
    let dataToSend = '';
    let json_data = '';
    http.get(path, function (res) {
        if (res.statusCode >= 200 && res.statusCode < 400) {
            res.on('data', function (res) { json_data += res.toString(); });
            res.on('end', function () {
                json_data = json_data.toString().replace("\ufeff", "");
                parser.parseString(json_data, function (err, result) {
                    // Details from Goodreads
                    dataToSend = 'Great! Here are the details you requested';
                    dataToSend += '<br />Book Name: ' + result.GoodreadsResponse.book[0].title[0] + ' written by ' + result.GoodreadsResponse.book[0].authors[0].author[0].name[0];
                    dataToSend += '<br />Average rating for this book is ' + result.GoodreadsResponse.book[0].average_rating[0] + ' by ' + result.GoodreadsResponse.book[0].ratings_count[0] + ' users in goodreads.com';
                    if (result.GoodreadsResponse.book[0].isbn[0] != undefined && result.GoodreadsResponse.book[0].isbn[0] != '')
                        dataToSend += '<br />You can buy this book at: ' + 'https://www.amazon.in/dp/' + result.GoodreadsResponse.book[0].isbn[0];
                    else if (result.GoodreadsResponse.book[0].kindle_asin[0] != undefined && result.GoodreadsResponse.book[0].kindle_asin[0] != '')
                        dataToSend += '<br />You can buy this book at: ' + 'https://www.amazon.in/dp/' + result.GoodreadsResponse.book[0].kindle_asin[0];
                    if (result.GoodreadsResponse.book[0].description[0] != undefined && result.GoodreadsResponse.book[0].description[0] != ''){
                        dataToSend += "<br /><br />Here's the brief about the book for you";
                        dataToSend += "<br />" + result.GoodreadsResponse.book[0].description[0];
                    }
                    dataToSend += '<br /><br />Happy Reading :)';
                    callback(dataToSend);
                });
            });
        }
        else {
            dataToSend = 'Sorry! No book found in goodreads.com';
            callback(dataToSend);
        }
    });
}

function fetch_author_details(authorName, callback) {
    let path = goodreads_host + '/search/index.xml?key=Fr4FMxJzYpn5HgZVvb5eQ&q=' + authorName + '+&search=author';
    let dataToSend = '';
    let json_data = '';
    let inc = 0;
    http.get(path, function (res) {
        if (res.statusCode >= 200 && res.statusCode < 400) {
            res.on('data', function (res) { json_data += res.toString(); });
            res.on('end', function () {
                json_data = json_data.toString().replace("\ufeff", "");
                parser.parseString(json_data, function (err, result) {
                    // Details from Goodreads
                    dataToSend = 'Work by ' + authorName + ' ';
                    for (var i = 0; i < result.GoodreadsResponse.search[0].results[0].work.length; i++) {
                        var author_web = result.GoodreadsResponse.search[0].results[0].work[i].best_book[0].author[0].name[0];
                        author_web = author_web.replace(/[^a-zA-Z0-9]/g, '');
                        var author_input = authorName.replace(/[^a-zA-Z0-9]/g, '');
                        if (author_input.toLowerCase().indexOf(author_web.toLowerCase()) > -1) {
                            dataToSend += '<br />' + (inc + 1) + '. ' + result.GoodreadsResponse.search[0].results[0].work[i].best_book[0].title[0];
                            dataToSend += ', with average rating of ' + result.GoodreadsResponse.search[0].results[0].work[i].average_rating[0];
                            inc += 1;
                        }
                    }
                    if (inc == 0) {
                        dataToSend = 'Sorry! No books found in goodreads.com';
                        callback(dataToSend);
                    } else {
                        callback(dataToSend);
                    }
                });
            });
        }
    });
}

server.post('/get-details', function (req, res) {
    let bookType = req.body.result.parameters.bookType;
    let bookName = req.body.result.parameters.bookName;
    let authorName = req.body.result.parameters.authorName;

    if (bookType != undefined || (bookName != undefined && bookName != '') || authorName != undefined) {
        if (bookName != undefined && bookName != '') {
            fetch_goodreads_review(bookName, function (result) {
                if (result !== undefined) {
                    return res.json({
                        speech: result,
                        displayText: result
                    });
                }
            });
        } else if (bookType != undefined && bookType != '' && (authorName === undefined || authorName == '')) {
            fetch_book_details(bookType.toLowerCase(), function (result) {
                if (result !== undefined) {
                    return res.json({
                        speech: result,
                        displayText: result
                    });
                }
            });
        } else {
            fetch_author_details(authorName, function (result) {
                if (result !== undefined) {
                    return res.json({
                        speech: result,
                        displayText: result
                    });
                }
            });
        }
    }
    else {
        return res.json({
            speech: "Sorry, I didn't get that",
            displayText: "Sorry, I didn't get that"
        });
    }
});

server.listen((process.env.PORT || 8000), function () {
    console.log("Server is up and running...");
});