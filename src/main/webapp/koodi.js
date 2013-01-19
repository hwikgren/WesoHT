//"use strict";

var etusivu;
var otsikko;
var kuvat;
var naytettavaKuva;
var osoite;
var etusivu;

var sivu = {
    model: {},
    view: {}
};

//header ja footer (päävalikon "Egyptologia" ei vielä toimi)
sivu.view.NavigaatioView = Backbone.View.extend({
    el: $("header"),
    initialize: function() {
        var oikeudet = "&copy Suomen Egyptologinen Seura "+(new Date).getFullYear();
        var alareuna = {
            "copyright": oikeudet
        } 
        $("#ala").html(Mustache.render($("#footer-template").html(), alareuna));
        etusivu = true;
        new sivu.view.EtusivuView();
    },
    events: {
        "click a:nth(0)": "etusivu",
        "click a:nth(1)": "jasenyys",
        "click a:nth(2)": "toiminta"
    },
    etusivu: function() {
        
    },
    jasenyys: function(eventInfo) {
        etusivu = false;
        eventInfo.preventDefault();
        $.getJSON("jasen.json", function(palautus) {
            new sivu.view.JasenView({
                model: palautus
            })
        });
        varjaaTab(1);
    },
    toiminta: function(eventInfo) {
        etusivu = false;
        eventInfo.preventDefault();
        $.getJSON("esitelmat.json", function(palautus) {
            new sivu.view.ToimintaView({
                model: palautus
            });
        });
        varjaaTab(2);
    }
});

//Etusivun ("Seura") sivuvalikon näyttäminen ja toiminta
sivu.view.EtusivuView = Backbone.View.extend({
    el: $("#sivuvalikko"),
    initialize: function() {
        $.getJSON("tiedot.json", function(palautus){
            osoite = palautus[0].osoite;
        });
        haeSeuraTekstit("seura.json", "Seura");
        this.render(0);
    },
    events: {
        "click a:nth(0)": "seura",
        "click a:nth(1)": "historia",
        "click a:nth(2)": "hallitus"
    },
    render: function(index) {
        varjaaLinkki(index);
        varjaaTab(0);
        
    },
    seura: function(eventInfo) {
        haeSeuraTekstit("seura.json", "Seura");
        eventInfo.preventDefault();
        this.render(0);
    },
    historia: function(eventInfo) {
        haeSeuraTekstit("hist.json", "Seuran historia");
        eventInfo.preventDefault();
        this.render(1);
    },
    hallitus: function(eventInfo) {
        $.getJSON("kuvat.json", function(palautus) {
            kuvat = palautus;
        });
        haeSeuraTekstit("hallitus.json", "Seuran hallitus 2012");
        eventInfo.preventDefault();
        this.render(2);
    }
});

//Etusivun ja sen sivuvalikosta löytyvien sivujen näyttäminen ("Seuran säännöt" ei vielä toimi)
sivu.view.SeuraView = Backbone.View.extend({
    el: $("#main"),
    initialize: function() {
        console.log("päästiin");
        $(window).resize(function() {
        if (etusivu == true && window.innerWidth > 950) {
            muutaKokoa(8, 9, 4, 3);
        }
        else if (etusivu == true) {
            muutaKokoa(9, 8, 3, 4);
            
        }
    });
        this.render();
    },
    events: {
        "click p": "lisaaKuva"
    },
    render: function() {
        var tekstit = {
            "otsikko": otsikko,
            "osoite": osoite,
            "list": this.model
        }
        $("#tekstispan").removeClass("span6");
        $("#tekstispan").addClass("span12");
        $("#kuvaspan").removeClass("span6");
        $("#kuvaspan").addClass("piilossa");
        $("#tekstit").html(Mustache.render($("#teksti-template").html(), tekstit));
        $("#sivuvalikko").html(Mustache.render($("#sivu-template").html(), tekstit));
        $("#osoite").html(Mustache.render($("#osoite-template").html(), tekstit));
    },
    lisaaKuva: function(eventInfo) {
        eventInfo.preventDefault();
        var id = $(eventInfo.currentTarget).data("id");
        naytaKuva(id);
        new sivu.view.KuvaView({
            model: this.model
        });
    }
});

//Oikean kuvan etsiminen
function naytaKuva(id) {
    naytettavaKuva = $.grep(kuvat, function(kuva, index) {
        if (kuva.id === id) {
            return kuva.kuva;
        }
        return null;
    });
}

//kuvan näyttäminen hallituksen jäsenen nimeä painettaessa (vain osassa kuva!)
sivu.view.KuvaView = Backbone.View.extend({
    el: $("#main"),
    initialize: function() {
        this.render();
    },
    render: function() {
        var tekstit = {
            "otsikko": "Seuran hallitus 2012",
            "list": this.model
        }
        var naytettava = {
            "otsikko": "Seuran hallitus 2012",
            "list": this.model,
            "kuvat": naytettavaKuva
        }
        $("#tekstispan").removeClass("span12");
        $("#tekstispan").addClass("span6");
        $("#kuvaspan").removeClass("piilossa");
        $("#kuvaspan").addClass("span6");
        $("#kuva").html(Mustache.render($("#kuva-template").html(), naytettava));
    }
});

//Päävalikon "Jäsenyys"-näkymä
sivu.view.JasenView = Backbone.View.extend({
    el: $("#main"),
    initialize: function() {
        this.render();
    },
    render: function() {
        var tekstit = {
            "otsikko": "Seuran jäsenyys",
            "list": this.model
        }
        $("#mainspan").removeClass("span8");
        $("#mainspan").removeClass("span9");
        $("#mainspan").addClass("span12");
        $("#tekstispan").removeClass("span6");
        $("#tekstispan").addClass("span12");
        $("#kuvaspan").removeClass("span6");
        $("#kuvaspan").addClass("piilossa");
        $("#sivuspan").removeClass("span4");
        $("#sivuspan").removeClass("span3");
        $("#sivuspan").addClass("piilossa");
        $("#tekstit").html(Mustache.render($("#teksti-template").html(), tekstit));
    }
});

//Päävalikon "Toiminta"-näkymä
sivu.view.ToimintaView = Backbone.View.extend({
    el: $("#main"),
    initialize: function() {
        otsikko = "Toiminta";
        this.render();
    },
    render: function() {
        var tekstit = {
            "otsikko": otsikko,
            list: this.model
        }
        $("#mainspan").removeClass("span12");
        $("#mainspan").addClass("span8");
        $("#tekstispan").removeClass("span6");
        $("#tekstispan").addClass("span12");
        $("#kuvaspan").removeClass("span6");
        $("#kuvaspan").addClass("piilossa");
        $("#sivuspan").removeClass("piilossa");
        $("#sivuspan").addClass("span4");
        $("#valikkospan").removeClass("span12");
        $("#sivuvalikko").addClass("piilossa");
        $("#tekstit").html(Mustache.render($("#teksti-template").html(), tekstit));
    }
});

//Etusivun eri tekstien näyttäminen
function haeSeuraTekstit(nimi, otsake) {
    $.getJSON(nimi, function(palautus) {
        otsikko = otsake;
        new sivu.view.SeuraView({
            model: palautus
        });
    });
}

//Sivuvalikon käytössä olevan linkin värittäminen (ei enää toimi ;-(
function varjaaLinkki(index) {
    $("#sivuvalikko nav ul li a").removeClass("kaytossa");
    $("#sivuvalikko nav ul li a:eq("+index+")").addClass("kaytossa");
}

//Päävalikon käytössä olevan linkin värittäminen
function varjaaTab(index) {
    $("header nav ul li a").removeClass("kaytossa");
    $("header nav ul li a:eq("+index+")").addClass("kaytossa");
}

function muutaKokoa(eka, toka, kolmas, neljas) {
    $("#mainspan").removeClass("span"+eka);
    $("#mainspan").addClass("span"+toka);
    $("#sivuspan").removeClass("span"+kolmas);
    $("#sivuspan").addClass("span"+neljas);
}


$(document).ready(function() {
    if (window.innerWidth > 950) {
        muutaKokoa(8, 9, 4, 3);
    }
    
    
    new sivu.view.NavigaatioView({});
    
});