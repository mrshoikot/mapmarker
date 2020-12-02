$(document).ready(function(){
    $('.disabled').change(function(){
        if (!this.checked){
            $(this).parent().addClass('disable');
            $(this).parent().find('input, select').attr('disabled', true);
            $(this).attr('disabled', false);
        }else{
            $(this).parent().removeClass('disable');
            $(this).parent().find('input, select').attr('disabled', false);
        }
    })
});



function getOwnedYear(){
    let year = document.getElementById('ownYear').value;

    if(!year || !document.getElementById('ownYearCheck').checked){
        return false;
    }else{
        return {
            operator: document.getElementById('ownYearOp').value,
            year: year
        }
    }
}


let filters = {
    ownYear: function(item){
        let input = getOwnedYear();
    
        if (!input){
            return true;
        }else{
            if (input.operator == '>'){
                if (item.num_years_owed > input.year){
                    return true;
                }
            }else if (input.operator == '='){
                if (item.num_years_owed == input.year){
                    return true;
                }
            }else if (input.operator == '<'){
                if (item.num_years_owed < input.year){
                    return true;
                }
            }
            return false;
        }
    },
    sherSale: function(item){
        if (document.getElementById('sherSaleCheck').checked) {
            if (document.getElementById('sherSale').checked){
                return item.sheriff_sale === 'Y';
            }else{
                return item.sheriff_sale === 'N';
            }
        }else{
            return true;
        }
    },
    bankr: function(item){
        if (document.getElementById('bankrCheck').checked) {
            if (document.getElementById('bankr').checked){
                return item.bankruptcy;
            }else{
                return !item.bankruptcy;
            }
        }else{
            return true;
        }
    },
    live: function(item){
        if (document.getElementById('liveCheck').checked) {
            if (document.getElementById('live').checked) {
                return item.street_address == item.mailing_address;
            }else{
                return item.street_address != item.mailing_address;
            }
        }else{
            return true;
        }
    },
    desc: function(item){
        if (document.getElementById('descCheck').checked) {
            return item.general_building_description == document.getElementById('desc').value;
        }else{
            return true;
        }
    },
    result: function(item){
        return this.ownYear(item) && this.sherSale(item) && this.bankr(item) && this.desc(item) && this.live(item);
    }
}


let map, lat = 39.97460054, lang=-75.16314899, center, zoom = 14;

function initMap() {

    if (map){
        center = map.getCenter();
        zoom = map.getZoom();
    }else{
        center = new google.maps.LatLng(lat, lang);
    }

    map = new google.maps.Map(document.getElementById("map"), {
        zoom: zoom,
        center: center,
        mapTypeId: "terrain",
    });
    $.getJSON("big.json", function (json) {
        map.data.loadGeoJson(eqfeed_callback(json));
    })
}

let descPushed = false;

const eqfeed_callback = function (results) {
    let desc = [];
    for (let i = 0; i < results.length; i++) {

        if (!descPushed){
            let desValue = results[i].general_building_description;

            if (!desc.includes(desValue)){
                desc.push(desValue);
                document.getElementById('desc').add(new Option(desValue, desValue));
            }
        }

        
        if (filters.result(results[i])){
            mark(results[i]);
        }
        
    }
    descPushed = true;
};


function mark(item){
    const latLng = new google.maps.LatLng(item.lat, item.lon);
    const contentString =
        "</div>" +
        '<h4 id="firstHeading" class="firstHeading">' + item.street_address + '</h4>' +
        "</div>";
    const infowindow = new google.maps.InfoWindow({
        content: contentString,
    });
    const marker = new google.maps.Marker({
        position: latLng,
        map: map,
        title: item.street_address
    });
    marker.addListener("click", () => {
        infowindow.open(map, marker);
    });
}
