/*
 * Parser for fireHOL ipset and netset files
 * Returns a flat array of IP addresses
 */
const fs = require('fs');
const cidrRange = require('cidr-range');

const IP_REGEX = /([0-9]{1,3}.?){1,4}/;
const MAX_MASK = 8;

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
    return line.trim();
  },
  /*
   * Takes the contents of a ipset or netset file (no need to differentiate)
   * Returns a flattened array of all ips in the file
   */
  parseFile: function(file){
    lines = file.split('\n');
    file = null;
    let addresses = [];
    let ranges = [];
    for(var i = 0; i < lines.length; i++){
      let ip = module.exports.parseLine(lines[i]);
      if(!ip) continue;
      if(ip.indexOf('/') !== -1){
        if(ip.split('/')[1] >= MAX_MASK){
          ranges.push(ip);
        }
      }else{
        addresses.push(ip);
      }
      lines[i] = null;
    }
    lines = null;
    return {addresses: addresses, ranges: ranges};
  }
};
