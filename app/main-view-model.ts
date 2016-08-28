import observable = require("data/observable");

export class HelloWorldModel extends observable.Observable {

  private _counter: number;
  private _message: string;

  get message(): string {
    return this._message;
  }
  set message(value: string) {
    if (this._message !== value) {
      this._message = value;
      this.notifyPropertyChange("message", value);
    }
  }

  private addStatus(status: string) {
    this.message += `${status}\n`;
  }

  constructor() {
      super();
      this.message = "";
  }

  public onTap() {
    // this would be much cleaner with async await, but I am waiting for
    // nativescript to support it without babel
    // https://github.com/NativeScript/NativeScript/issues/2541

    this.addStatus("Running: getRandomValues");
    const iv = crypto.getRandomValues(new Uint8Array(16));
    this.addStatus("Running: waiting for getRandomValues");
    let aesKey;
    (iv as any)._promise.then(() => {
      this.addStatus(`Updated array: ${iv}`);
      this.addStatus("Running: generateKey");
      return crypto.subtle.generateKey(
        ({name: "AES-CBC", length: 128} as any), // Algorithm the key will be used with
        true,                           // Can extract key value to binary string
        ["encrypt", "decrypt"]          // Use for these operations
      );
    }).then(aesKey_ => {
      aesKey = aesKey_;
      this.addStatus(`Running: Got aesKey ${aesKey._jwk}`);

      this.addStatus("Running: Creating array");
      const plainTextString = "This is very sensitive stuff.";

      const plainTextBytes = new Uint8Array(plainTextString.length);
      for (let i = 0; i < plainTextString.length; i++) {
          plainTextBytes[i] = plainTextString.charCodeAt(i);
      }
      this.addStatus("Running: encrypt");
      return crypto.subtle.encrypt(
        ({name: "AES-CBC", iv: iv} as any), // Random data for security
        aesKey,                    // The key to use
        plainTextBytes             // Data to encrypt
      );
    }).then(cipherTextBytes => {
      this.addStatus("Running: decrypt");
      return crypto.subtle.decrypt(
        ({name: "AES-CBC", iv: iv} as any), // Same IV as for encryption
        aesKey,                    // The key to use
        cipherTextBytes            // Data to decrypt
      );
    }).then(decryptedBuffer => {
      const decryptedBytes = new Uint8Array(
        decryptedBuffer
      );

      this.addStatus("Running: creating string");
      let decryptedString = "";
      for (let i = 0; i < decryptedBytes.byteLength; i++) {
          decryptedString += String.fromCharCode(decryptedBytes[i]);
      }
      this.addStatus(`Decrypted: ${decryptedString}`);
    });
  }
}
