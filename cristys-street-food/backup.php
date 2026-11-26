<?php
// Run from Windows Task Scheduler: C:\xampp\php\php.exe C:\xampp\htdocs\cristys-street-food\backup.php
$config=require __DIR__.DIRECTORY_SEPARATOR.'config.php';
$DB_HOST=$config['db_host'];$DB_NAME=$config['db_name'];$DB_USER=$config['db_user'];$DB_PASS=$config['db_pass'];
$target=dirname(__DIR__,2).DIRECTORY_SEPARATOR.'cristys-street-food-backups';
if(!is_dir($target)&&!mkdir($target,0700,true)){fwrite(STDERR,"Cannot create backup directory: $target\n");exit(1);}
try{
 $db=new PDO("mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4",$DB_USER,$DB_PASS,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]);
 $data=['created_at'=>date(DATE_ATOM)];
 foreach(['items','sales','audit_log'] as $table){try{$data[$table]=$db->query("SELECT * FROM `$table` ORDER BY id")->fetchAll();}catch(PDOException $e){if($table==='audit_log')$data[$table]=[];else throw $e;}}
 try{$data['users']=$db->query('SELECT id,username,role,created_at FROM users ORDER BY id')->fetchAll();}catch(PDOException $e){$data['users']=[];}
 $file=$target.DIRECTORY_SEPARATOR.'cristys-backup-'.date('Y-m-d-His').'.json';
 $json=json_encode($data,JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR);$tmp=$file.'.tmp';
 if(file_put_contents($tmp,$json,LOCK_EX)===false||!rename($tmp,$file))throw new RuntimeException('Could not write backup file.');
 $hash=hash_file('sha256',$file);$sumFile=$file.'.sha256';$sumTmp=$sumFile.'.tmp';
 if($hash===false||file_put_contents($sumTmp,$hash.'  '.basename($file)."\n",LOCK_EX)===false||!rename($sumTmp,$sumFile))throw new RuntimeException('Could not write SHA-256 checksum.');
 // Retain the latest 30 daily backups to keep disk use bounded.
 $files=glob($target.DIRECTORY_SEPARATOR.'cristys-backup-*.json')?:[];usort($files,fn($x,$y)=>filemtime($y)<=>filemtime($x));foreach(array_slice($files,30) as $old){@unlink($old);@unlink($old.'.sha256');}
 echo "Backup created: $file\nSHA-256: $hash\nChecksum: $sumFile\n";
}catch(Throwable $e){fwrite(STDERR,"Backup failed: ".$e->getMessage()."\n");exit(1);}
