/*
 * Parser for fireHOL ipset and netset files
 * Returns a flat array of IP addresses
 */
const fs = require('fs');
const cidrRange = require('cidr-range');

const IP_REGEX = /([0-9]{1,3}.?){1,4}/;

module.exports = {
  /*
   * Takes an unmodified line of an ipset or netset file
   * Returns either null, a string, or an array of ipaddreses
   */
  parseLine: function(line){
    if(line[0] === '#') return null;
    if(line.length < 1) return null;
    let ip = line.match(IP_REGEX)[0];
    if(!ip){
      return null;
    }
    //we have a valid IP address
    if(line.indexOf('/') !== -1){
      //we have a range
      return {type: 'range', address: line.trim()};
    }else{
      //we have a single address
      return {type: 'address', address: ip};
    }

  },
  /*
   * Takes the contents of a ipset or netset file (no need to differentiate)
   * Returns a flattened array of all ips in the file
   */
  parseFile: function(file){
    lines = file.split('\n');
    let addresses = [];
    let ranges = [];
    for(var i = 0; i < lines.length; i++){
      let ip = module.exports.parseLine(lines[i]);
      if(!ip) continue;
      if(ip.type === 'address'){
        addresses.push(ip.address);
      }else if(ip.type === 'range'){
        ranges.push(ip.address);
      }
    }
    return {addresses: addresses, ranges: ranges};
  }
};
