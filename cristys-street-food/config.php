<?php
// Load local configuration without requiring Composer or overwriting server env vars.
$envPath=__DIR__.DIRECTORY_SEPARATOR.'.env';
if(is_file($envPath)&&is_readable($envPath)){
  foreach(file($envPath,FILE_IGNORE_NEW_LINES)?:[] as $line){
    $line=trim($line);
    if($line===''||$line[0]==='#'||strpos($line,'=')===false)continue;
    [$key,$value]=array_map('trim',explode('=',$line,2));
    if(!preg_match('/^[A-Z_][A-Z0-9_]*$/',$key)||getenv($key)!==false)continue;
    if(strlen($value)>=2&&(($value[0]==='"'&&substr($value,-1)==='"')||($value[0]==="'"&&substr($value,-1)==="'")))$value=substr($value,1,-1);
    putenv($key.'='.$value);$_ENV[$key]=$value;
  }
}
$encryptionHex=getenv('APP_ENCRYPTION_KEY');
$encryptionKey=is_string($encryptionHex)&&preg_match('/^[a-fA-F0-9]{64}$/D',$encryptionHex)?hex2bin($encryptionHex):null;
return [
  'db_host'=>getenv('DB_HOST')!==false?getenv('DB_HOST'):'localhost',
  'db_name'=>getenv('DB_NAME')!==false?getenv('DB_NAME'):'cristy_street_food',
  'db_user'=>getenv('DB_USER')!==false?getenv('DB_USER'):'root',
  'db_pass'=>getenv('DB_PASS')!==false?getenv('DB_PASS'):'',
  'encryption_key'=>$encryptionKey,
];
