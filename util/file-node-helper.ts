/**
 * @copyright Copyright (c) 2024, 2025, 2025 Claus-Justus Heine <himself@claus-justus-heine.de>
 * @author Claus-Justus Heine <himself@claus-justus-heine.de>
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

import { getCurrentUser } from '@nextcloud/auth';
import { join } from 'path';
import { File, Folder, FileType } from '@nextcloud/files';
import { generateRemoteUrl } from '@nextcloud/router';

export interface FileInfoDTO {
  fileid: number,
  path: string,
  topLevelFolder: string,
  relativePath: string,
  basename: string,
  lastmod: number,
  mime: string,
  size: number,
  type: FileType,
  hasPreview: boolean,
  permissions: number,
  'mount-type': string,
  etag: string,
}

/**
 * @param fileInfo File-info object.
 *
 * @param owner If undefined the current user is used.
 *
 * @return Result.
 */
export const fileInfoToNode = (fileInfo: FileInfoDTO, owner?: string) => {
  owner = owner || getCurrentUser()!.uid;
  const userFrontEndFolder = '/' + owner + '/files';
  if (fileInfo.topLevelFolder !== userFrontEndFolder) {
    throw new Error(`${fileInfo.path} is located outside of the front end user file space ${userFrontEndFolder}.`);
  }
  const nodeData = {
    id: fileInfo.fileid,
    source: generateRemoteUrl(join('dav/files', owner, fileInfo.relativePath)),
    root: `/files/${owner}`,
    mime: fileInfo.mime,
    mtime: new Date(fileInfo.lastmod * 1000),
    owner,
    size: fileInfo.size,
    permissions: fileInfo.permissions,
    attributes: {
      ...fileInfo,
      'has-preview': fileInfo.hasPreview,
    },
  };
  return fileInfo.type === 'file' ? new File(nodeData) : new Folder(nodeData);
};
