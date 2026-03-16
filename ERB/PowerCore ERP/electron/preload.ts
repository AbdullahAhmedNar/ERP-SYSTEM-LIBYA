import { contextBridge, ipcRenderer } from 'electron';

const channels = [
  'db:loadState',
  'db:saveState',
  'db:getBackupPath',
  'backup:copySqlite',
  'backup:restoreFromSqlite',
];

contextBridge.exposeInMainWorld('electronAPI', {
  invoke: (channel: string, ...args: any[]) => {
    if (channels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    }
    throw new Error(`Unauthorized channel: ${channel}`);
  },
  isElectron: true,
});
