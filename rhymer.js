const version = "1.6.0";
const alphabet_sorted = "اأإآبتثجحخدذرزسشصضطظعغفقكلمنهوي";

$(document).ready(function () {

    // get wordlist
    var words;
    var sh3r;

    $.getJSON("wordlist.json").done(function (data) {
        words = data;
        $('#target').animateNumber({
            number: words.length,
            color: 'green',
            'font-size': '30px',
            easing: 'easeInQuad',
            numberStep: function (now, tween) {
                var floored_number = Math.floor(now),
                    target = $(tween.elem);
                target.text(numberWithCommas(floored_number).toString().toArDigits());
            }
        }, 5000);

    });

    $.getJSON("sh3rlines.json").done(function (data) {
        sh3r = data;
    });

    alphabet_sorted.split('').forEach(letter => {
        $("#filter").append(new Option(`قافية تبدأ بحرف الـ ${letter}`, letter));
    });

    // random button event
    $('#random').click(function () {
        random(sh3r, sh3r.length);
    });

    // click button event
    $('#search').click(function () {
        //console.log(words.length);
        ($("#filter").val() == "sh3r") ? search(sh3r, sh3r.length) : rhymer(words, words.length);
    });

    // filter change event
    $('#filter').change(function (event) {
        ($("#filter").val() == "sh3r") ? $("#word").attr("placeholder", "اكتب كلمة للبحث عنها مثل: حبيت, مشاعرها, غرامك") : $("#word").attr("placeholder", "اكتب نهاية كلمة مثل: هي, ية, ردة");
    });

    // press enter event
    $('input').keypress(function (event) {
        if (event.keyCode == 13)
            ($("#filter").val() == "sh3r") ? search(sh3r, sh3r.length) : rhymer(words, words.length);
    });

    // clear button
    $('.results a').click(function () {
        $(".results ol").empty();
    });

    //change placeholder
    $('.results a').click(function () {
        $(".results ol").empty();
    });

    $("#version").html(`قافي نسخة ${version.toArDigits()}`);

});


function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "،");
}

String.prototype.toArDigits = function () {
    var id = ['۰', '۱', '۲', '۳', '٤', '٥', '٦', '۷', '۸', '۹'];
    return this.replace(/[0-9]/g, function (w) {
        return id[+w]
    });
}


function ar_sort(words) {
    var final = [];
    var alphabet = {};

    alphabet_sorted.split('').forEach(letter => {
        alphabet[letter] = [];
    });

    words.forEach(word => {
        if (typeof (alphabet[word.charAt(0)]) == "undefined") return;
        alphabet[word.charAt(0)].push(word);

    });

    Object.values(alphabet).forEach((value) => {
        value.forEach(word => {
            final.push(word);
        });
    });

    return final
}

function remove_tashkel(word) {
    return word.replace(/[\u0617-\u061A\u064B-\u0652]/g, "").replace(/[0-9]/g, '');
}

function removeDups(names) {
    let unique = {};
    names.forEach(function (i) {
        if (!unique[i]) {
            unique[i] = true;
        }
    });
    return Object.keys(unique);
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function random(sh3r, sh3r_length) {
    $('#alert').html(``);
    $(".results ol").empty();

    const dice = getRandomInt(0, sh3r_length);


    var words_1 = sh3r[dice].split(' ');
    var words_2 = sh3r[dice + 1].split(' ');

    words_1[0] = `<span class="text-success">${words_1[0]}</span>`;
    words_2[0] = `<span class="text-success">${words_2[0]}</span>`;

    $(".results h3").addClass('text-info');
    $(".results ol").append('<li>' + words_1.join(' ') + '</li>');
    $(".results ol").append('<li>' + words_2.join(' ') + '</li>');

    $(".results").show();
}

function search(sh3r, sh3r_length) {
    $('#alert').html(``);
    var word = $('#word').val();
    $(".results h3").removeClass('text-info');
    $(".results ol").empty();

    if (word == '') {
        // alert('Cant search with empty input');
        $('#alert').html(`<p class="text-danger">لا يمكن البحث باستخدام مدخلات فارغة</p>`);
        return 0;
    }

    var i, dest;
    var words_arr = [];
    var first_arr = [];
    var last_arr = [];

    for (i = 0; i <= sh3r_length - 1; i++) {

        let sh3r_words = sh3r[i].split(' ');

        if (sh3r_words.length > 2) {
            if (sh3r_words[0] == word && !first_arr.includes(word))
                first_arr.push(remove_tashkel(sh3r[i]));

            else if (sh3r_words.slice(-1)[0] == word && !last_arr.includes(word))
                last_arr.push(remove_tashkel(sh3r[i]));

            else if (sh3r_words.includes(word) && !words_arr.includes(word))
                words_arr.push(remove_tashkel(sh3r[i]));
        }س
    }

    let result_arr = [
        ar_sort(last_arr),
        ar_sort(first_arr),
        ar_sort(words_arr)
    ];
    let result_arr_count = result_arr[0].length + result_arr[1].length + result_arr[2].length;

    if (result_arr[0].length != 0) {
        $(".results ol").append(`<br><p class="text-info" style="text-align:left;font-weight:300;font-style:italic;">نهاية الكلمة</p>`);
        result_arr[0].forEach(line => {
            $(".results ol").append('<li>' + line.replace(new RegExp(word, "g"), `<span class="text-success">${word}</span>`) + '</li>');
        })
    }

    if (result_arr[1].length != 0) {
        $(".results ol").append(`<br><p class="text-info" style="text-align:left;font-weight:300;font-style:italic;">بداية الكلمة</p>`);
        result_arr[1].forEach(line => {
            $(".results ol").append('<li>' + line.replace(new RegExp(word, "g"), `<span class="text-success">${word}</span>`) + '</li>');
        })
    }

    if (result_arr[2].length != 0) {
        $(".results ol").append(`<br><p class="text-info" style="text-align:left;font-weight:300;font-style:italic;">تتضمن الكلمة</p>`);
        result_arr[2].forEach(line => {
            $(".results ol").append('<li>' + line.replace(new RegExp(word, "g"), `<span class="text-success">${word}</span>`) + '</li>');
        })
    }



    if ($('.results ol li').length < 1) {
        $('#alert').html(`<p class="text-warning">لا يوجد نتائج بحث</p>`);
    } else {
        $(".results").show();
        $('#alert').html(`<p class="text-info" style="font-weight: 300;">عدد الاسطر الشعرية:${result_arr_count.toString().toArDigits()}</p>`);
    }
}

function rhymer(words, words_length) {
    $('#alert').html(``);

    var word = $('#word').val();
    //var depth = $('#depth').val();
    $(".results h3").removeClass('text-info');
    $(".results ol").empty();

    if (word == '') {
        // alert('Cant search with empty input');
        $('#alert').html(`<p class="text-danger">لا يمكن البحث باستخدام مدخلات فارغة</p>`);
        return 0;
    }

    var i, dest;
    var words_arr = [];

    for (i = 0; i <= words_length - 1; i++) {
        dest = levenshtein(word, words[i]);

        if (word == words[i].slice(-Number(word.length))) {

            if (dest < 7)
                words_arr.push(remove_tashkel(words[i]));
        }
    }

    let result_arr = removeDups(ar_sort(words_arr)).filter(word => ($("#filter").val() != 'all') ? word.charAt(0) == $("#filter").val() : word);

    result_arr.forEach(word => {
        $(".results ol").append('<li>' + word + '</li>');
    })

    if ($('.results ol li').length < 1) {
        $('#alert').html(`<p class="text-warning">لا يوجد نتائج بحث</p>`);
    } else {
        $(".results").show();
        $('#alert').html(`<p class="text-info" style="font-weight: 300;">عدد القوافي:${result_arr.length.toString().toArDigits()}</p>`);
    }

}