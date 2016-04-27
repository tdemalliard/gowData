$("#loadingImg").show();

$.getJSON( "res/Data/World.json", function( data ) {

    // construc troops
    var troops = new Troops( data.Troops );


    var troop1 = new Troop( data.Troops[1] );
    var troop3 = new Troop( data.Troops[3] );

    console.log( troop1, troop3 );
    console.log( troops );

    troops.display( '#gemData');
});

////////////////////////////////////////////////////////////////
// other functions

//  return the sum of an array
function sum( data ) {
    return data.reduce(function(pv, cv) { 
        return pv + cv; 
    }, 0);
}

////////////////////////////////////////////////////////////////
// troops
var Troops = function ( allTroops ) {
    this.troops = [];

    // create each troop
    allTroops.forEach ( function( troop ) {
        this.troops.push( new Troop( troop ) );
    }, this );

    // sort all troops by name
    this.troops = this.troops.sort( function( a, b ){ 
        return a.name.localeCompare(b.name);
    });

    // add a ID key for debug purpose
    this.troops.forEach( function( value, index, array ) {
        array[index].ct = index;
    } );
}

// update bonuses
function updateBonus( columns, tableId ) {
    // get columns to filter with
    var bonusColumns = [];
     columns.forEach(function ( value ) {
        if ( value[1].indexOf( 'lv20' ) > -1 ) {
            bonusColumns.push( value[1] );
        }
    });

    // add bonus
// Find the heading with the text THEHEADING
var columnTh = $("#troops #attack_lv20");

// Get the index & increment by 1 to match nth-child indexing
var columnIndex = columnTh.index( ) + 1; console.log(columnIndex);

// Set all the elements with that index in a tr green
$('table tr td:nth-child(' + columnIndex + ')').css("color", "green");

var bonus = $( '' );
$('table tr td:nth-child(' + columnIndex + ')').each( function ( ) {
    $( this ).text( parseInt( $( this ).text() ) + parseInt(  ) );
});


}

// display table of troops
Troops.prototype.display = function ( element ) {

    // choose what to display here
    // format : [ header name, object property to display, class based on object property]
    this.columns = [
        // ['',  'ct', 0],
        ['Name',  'name', 0],
        ['Rarity', 'rarityName', 1],
        ['Color', 'colorsHtml', 0],
        ['Spell', 'spell_lv20', 0],
        ['Atk', 'attack_lv20', 0],
        ['Health', 'health_lv20', 0],
        ['Armor', 'armor_lv20', 0],
    ];
    var table = '<table id="troops" class="table table-striped table-condensed sortable">'
        + '<thead>'
        + '<tr>';

    // construct table headers
    this.columns.forEach( function( value ) {
        table += '<th id="' + value[1] + '">' + value[0] + '</th>';
    } );

    table += '</tr><thead>'
        + '<tbody class="searchable">';

    // construct table content
    this.troops.forEach( function( troop ) {
        table += '<tr>';

        this.columns.forEach( function( value ) {
            // should we add a class?
            if ( value[2] != 0 ) {
                table += '<td class="' + troop[value[1]] + '">' + troop[value[1]] + '</td>';
            } else {
                table += '<td>' + troop[value[1]] + '</td>';
            }
        } );

        table += '</tr>';
    }, this );

    table += '</tbody></table>';

    // display the table
    $( element ).html( table );

    // add kingdom bonuses and filter support
    // on cellphone: 4 bonus input, [newline], filter input
    // on large devices: 4 bonus input + filter input same line
    var formHtml = '<form><div class="row form-group">';
    // begin bonus
    formHtml += '<div class="col-xs-12 col-sm-8">'
    // atk
    formHtml += '<div class="col-xs-3 col-sm-2"> <label for="attack_lv20-bonus">Attack</label>'
        + '<input id="attack_lv20-bonus" type="text" class="form-control" placeholder="0">'
        + '</div>';
    // armor
    formHtml += '<div class="col-xs-3 col-sm-2"> <label for="armor_lv20-bonus">Armor</label>'
        + '<input id="armor_lv20-bonus" type="text" class="form-control" placeholder="0">'
        + '</div>';
    // health
    formHtml += '<div class="col-xs-3 col-sm-2"> <label for="health_lv20-bonus">Health</label>'
        + '<input id="health_lv20-bonus" type="text" class="form-control" placeholder="0">'
        + '</div>';
    // spell
    formHtml += '<div class="col-xs-3 col-sm-2"> <label for="spell_lv20-bonus">Spell</label>'
        + '<input id="spell_lv20-bonus" type="text" class="form-control" placeholder="0">'
        + '</div>';
    // end bonus
    formHtml += '</div>';
    // filter
    formHtml += '<div class="col-xs-12 col-sm-4"> <label for="filter-troops">Filter troops </label>'
        + '<input id="filter-troops" type="text" class="form-control" placeholder="Type here...">'
        + '</div>';
    // end of bonus and filter form
    formHtml += '</div></form>';

    // display all that
    $( element ).prepend( formHtml );

    // add sortable support
    $.bootstrapSortable();

    // add filter support
    $('#filter-troops').keyup(function () {
        var rex = new RegExp($(this).val(), 'i');
        $('.searchable tr').hide();
        $('.searchable tr').filter(function () {
            return rex.test($(this).text());
        }).show();
    });

    // add bonus support
    updateBonus( this.columns, '#troops' );
}


var Troop = function ( jsonTroop ) {
    // json into object
    this.json = jsonTroop;
    this.rarityName = this.json.TroopRarity;
    this.name = jsonTroop.ReferenceName;

    // computed stats
    this.attack_lv20 = jsonTroop.Attack_Base 
        + sum( jsonTroop.AttackIncrease )
        + sum( jsonTroop.Ascension_Attack );
    this.health_lv20 = jsonTroop.Health_Base 
        + sum( jsonTroop.HealthIncrease )
        + sum( jsonTroop.Ascension_Health );
    this.armor_lv20 = jsonTroop.Armor_Base 
        + sum( jsonTroop.ArmorIncrease )
        + sum( jsonTroop.Ascension_Armor );
    this.spell_lv20 = jsonTroop.SpellPower_Base 
        + sum( jsonTroop.SpellPowerIncrease );

    // colors
    this.manaColors = []; // array of colors
    this.colorsHtml = ''; // colors html formated with color for diplay
    this.setManaColors();
}

// set manaColors as array of string colors
Troop.prototype.setManaColors = function ( ) { 
    // special case main color, keep it
    this.manaColors.push( this.json.PrimaryColor.toLowerCase() );

    for ( var key in this.json.ManaColors ) {
        // why orange color? skip it
        if ( key == 'ColorOrange' )
            continue;

        // get other colors?
        var color = key.slice( 5 ).toLowerCase();
        if ( this.json.ManaColors[key] == true && color != this.json.PrimaryColor.toLowerCase() ) {
            this.manaColors.push( color );
        }
    }

    // prepare mana colors for display
    this.displayManaColors();
}

Troop.prototype.displayManaColors = function ( ) {
    // 1st is primary color
    this.colorsHtml += '<strong><div class="' 
        + this.manaColors[0] 
        + '">'
        + this.manaColors[0] 
        + '</div></strong> ';

    for ( var key in this.manaColors ) {
        if ( key == 0 ) // skip main color
            continue;
        this.colorsHtml += '<div class="' + this.manaColors[key] + '">' 
            + this.manaColors[key] + '</div> ';
    }
}

// not used anymore
Troop.prototype.setRarity = function ( ) {
    var rarityList = {
        Common: 0,      // white
        Uncommon: 1,    // green
        Rare: 2,        // blue
        UltraRare: 3,   // purple
        Epic: 4,        // orange
    }

    this.rarityPower = rarityList[ this.json.TroopRarity ];
    this.rarityName = this.json.TroopRarity;
}

////////////////////////////////////////////////////////////////
// Display spells
function spellDisplayAll( spellList ) {
    // create element container
    $( '#gemData' ).append( '<div id="gowSpells">Spells:' );
    $( '#gowSpells' ).append( '<ul /> ');

    // display each spell
    spellList.forEach( spellDisplay );
}

function spellDisplay( spell ) {
    // display this spell
    $( '#gowSpells ul' ).append( '<li id="spell_' + spell.Id + '" />' );
    $( '#spell_' + spell.Id ).jsonViewer( spell, {collapsed: true} );
}


// winter IMP
// 9 true damage. if ennemy dies, +4 magic
// 8 atk
// 8 def
// 5 health
// 12 mana
// 3 spell


// SPELLLLLLL 
// Cost: 3,
// Description: "[SPELL7000_DESC]",
// Id: 7000,
// Name: "[SPELL7000_NAME]",
// OverrideAI: -1,
// Randomize: "None",
// SpellSteps: [1 item],
// Target: "Board"

// ArmorIncrease: [20 items],
// Armor_Base: 0,
// Armor_PerLevel: 1,
// Ascension_Armor: [5 items],
// Ascension_Attack: [5 items],
// Ascension_Health: [5 items],
// AttackIncrease: [20 items],
// Attack_Base: 2,
// Attack_PerLevel: 1,
// Description: "[Troop_K00_00_DESC]",
// DropChance: 100,
// FileBase: "Troop_K00_00",
// GoldToRecruit: 0,
// HealthIncrease: [20 items],
// Health_Base: 6,
// Health_PerLevel: 6,
// Id: 6000,
// ManaColors: {7 items},
// MaterialIdToRecruit: 0,
// MaterialsToRecruit: 0,
// Name: "[Troop_K00_00_NAME]",
// PortraitOffsetX: 0,
// PortraitOffsetY: 0,
// PrimaryColor: "Blue",
// ReferenceName: "Ogre",
// SoundCastSpell: "Ogre_Spell",
// SoundDeath: "Ogre_Death",
// SoundSelection: "Ogre_Select",
// SpellId: 7131,
// SpellPowerIncrease: [20 items],
// SpellPower_Base: 0,
// SpellPower_PerLevel: 2,
// TimeToRecruit: 0,
// Traits: [3 items],
// TroopRarity: "Common",
// TroopType: "Giant"

// AvatarSkins: [14 items],
// Clouds: [113 items],
// ConversationCharacters: [22 items],
// GuildTasks: [23 items],
// HeroClasses: [7 items],
// Kingdoms: [35 items],
// LootTables: [239 items],
// Materials: [25 items],
// Quests: [275 items],
// Spells: [327 items],
// Traits: [138 items],
// Troops: [186 items],
// Weapons: [142 items]