import dns from 'dns';

const hostname = 'zb7fpxi.mongodb.net';

dns.resolveSrv(`_mongodb._tcp.${hostname}`, (err, addresses) => {
    if (err) {
        console.error('SRV lookup failed:', err);
    } else {
        console.log('SRV Addresses:', addresses);
        addresses.forEach(addr => {
            dns.lookup(addr.name, (err, ip) => {
                if (err) console.error(`Lookup failed for ${addr.name}:`, err);
                else console.log(`IP for ${addr.name}:`, ip);
            });
        });
    }
});

dns.lookup(hostname, (err, address) => {
    if (err) console.error('Standard lookup failed:', err);
    else console.log('Standard IP:', address);
});
